import React, {
  useEffect,
  useState
} from "react";

import {
  states,
  stateDistrictMap,
  wbKeywords
} from "./data/geoFilters";

import worldKeywords from "./data/worldKeywords";

// ================= NEWS CARD =================
function NewsCard({
  item,
  detectNewsType,
  timeAgo
}) {
  const [isHovered, setIsHovered] =
    useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    window.open(item.link, "_blank");
  };

  const categoryColor = {
    CRIME: "#ff3b3b",
    POLITICAL: "#7c3aed",
    JOB: "#10b981",
    GOVT: "#3b82f6",
    SPORTS: "#f59e0b",
    BUSINESS: "#06b6d4",
    EDUCATION: "#8b5cf6",
    HEALTH: "#ec4899",
    TECH: "#14b8a6",
    ENTERTAINMENT: "#f97316",
    ENVIRONMENT: "#22c55e",
    OTHER: "#6b7280"
  }[detectNewsType(item.title + " " + (item.summary || ""))];

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isHovered
          ? categoryColor
          : "#2a2a2a",
        transform: isHovered
          ? "translateY(-4px) scale(1.01)"
          : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? `0 8px 32px ${categoryColor}40, 0 0 0 1px ${categoryColor}80`
          : "0 4px 16px rgba(0,0,0,0.4)"
      }}
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
      onClick={handleClick}
    >
      {/* Ripple Effect */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            borderRadius: "50%",
            background: `${categoryColor}40`,
            transform: "translate(-50%, -50%)",
            animation: "ripple 0.6s ease-out",
            pointerEvents: "none"
          }}
        />
      ))}

      {/* Top Accent Line */}
      <div style={{
        ...styles.accentLine,
        background: categoryColor
      }} />

      <h3 style={{
        ...styles.head,
        color: isHovered ? categoryColor : "#00d4ff"
      }}>
        {item.title}
      </h3>

      {item.summary && (
        <p style={styles.text}>
          {item.summary}
        </p>
      )}

      {/* CATEGORY BADGE */}
      <div style={{
        ...styles.badge,
        background: `${categoryColor}20`,
        borderLeft: `3px solid ${categoryColor}`,
        color: categoryColor
      }}>
        🏷 {detectNewsType(
          item.title +
            " " +
            (item.summary || "")
        )}
      </div>

      <div style={styles.metaBar}>
        <span style={styles.metaItem}>
          📰 {item.source}
        </span>

        <span style={styles.metaItem}>
          📂 {item.category}
        </span>

        <span style={styles.metaItem}>
          🕒{" "}
          {item.published_at
            ? `${new Date(
                item.published_at
              ).toLocaleString(
                "en-IN",
                {
                  timeZone:
                    "Asia/Kolkata",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                }
              )} • ${timeAgo(
                item.published_at
              )}`
            : "No Time"}
        </span>
      </div>

      {/* Hover Indicator */}
      {isHovered && (
        <div style={styles.hoverIndicator}>
          Click to open →
        </div>
      )}
    </div>
  );
}

function App() {
  const [news, setNews] =
    useState([]);

  const [filterWB, setFilterWB] =
    useState(false);

  const [filterWorld, setFilterWorld] =
    useState(false);

  const [state, setState] =
    useState("ALL");

  const [district, setDistrict] =
    useState("ALL");

  const [searchText, setSearchText] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [timeFilter, setTimeFilter] =
    useState("ALL");

  const [newsType, setNewsType] =
    useState("ALL");

  // ================= FETCH NEWS =================
  const fetchNews = async () => {
    setIsLoading(true);

    try {
      const cached =
        localStorage.getItem("news");

      const cachedTime =
        localStorage.getItem(
          "news_time"
        );

      const now = Date.now();

      // CACHE 60 SEC
      if (
        cached &&
        cachedTime &&
        now - cachedTime < 60000
      ) {
        setNews(JSON.parse(cached));

        setIsLoading(false);

        return;
      }

      const res = await fetch(
        "https://news-backend-7tnv.onrender.com/news"
      );

      const data = await res.json();

      setNews(data);

      localStorage.setItem(
        "news",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "news_time",
        Date.now()
      );

      setLastUpdated(
        new Date().toLocaleString(
          "en-IN",
          {
            timeZone:
              "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }
        )
      );
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= AUTO FETCH =================
  useEffect(() => {
    fetchNews();

    const interval =
      setInterval(() => {
        fetchNews();
      }, 300000);

    return () =>
      clearInterval(interval);
  }, []);

  // ================= TIME AGO =================
  const timeAgo = (
    dateString
  ) => {
    if (!dateString) return "";

    const now = new Date();

    const past = new Date(
      dateString
    );

    const diff =
      (now - past) / 1000;

    const minutes =
      Math.floor(diff / 60);

    const hours =
      Math.floor(diff / 3600);

    const days =
      Math.floor(diff / 86400);

    if (minutes < 1)
      return "Just now";

    if (minutes < 60)
      return `${minutes} mins ago`;

    if (hours < 24)
      return `${hours} hrs ago`;

    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // ================= WB FILTER =================
  const isWB = (text) => {
    const t = text.toLowerCase();

    return wbKeywords.some((k) =>
      t.includes(k.toLowerCase())
    );
  };

  // ================= WORLD FILTER =================
  const isWorldNews = (text) => {
    const t = text.toLowerCase();

    return worldKeywords.some((k) =>
      t.includes(k.toLowerCase())
    );
  };

  // ================= ENHANCED CATEGORY DETECTION =================
  const detectNewsType = (text) => {
    const t = text.toLowerCase();

    // CRIME
    if (
      t.includes("murder") ||
      t.includes("crime") ||
      t.includes("arrest") ||
      t.includes("violence") ||
      t.includes("fraud") ||
      t.includes("attack") ||
      t.includes("robbery") ||
      t.includes("theft") ||
      t.includes("rape") ||
      t.includes("accused") ||
      t.includes("victim") ||
      t.includes("police")
    ) {
      return "CRIME";
    }

    // POLITICAL
    if (
      t.includes("bjp") ||
      t.includes("tmc") ||
      t.includes("congress") ||
      t.includes("minister") ||
      t.includes("election") ||
      t.includes("parliament") ||
      t.includes("cm") ||
      t.includes("pm") ||
      t.includes("govt") ||
      t.includes("party") ||
      t.includes("politics")
    ) {
      return "POLITICAL";
    }

    // JOB
    if (
      t.includes("job") ||
      t.includes("recruitment") ||
      t.includes("vacancy") ||
      t.includes("apply") ||
      t.includes("hiring") ||
      t.includes("career") ||
      t.includes("exam")
    ) {
      return "JOB";
    }

    // GOVT
    if (
      t.includes("notification") ||
      t.includes("scheme") ||
      t.includes("official") ||
      t.includes("circular") ||
      t.includes("order") ||
      t.includes("department")
    ) {
      return "GOVT";
    }

    // SPORTS
    if (
      t.includes("cricket") ||
      t.includes("football") ||
      t.includes("match") ||
      t.includes("sports") ||
      t.includes("tournament") ||
      t.includes("team") ||
      t.includes("player") ||
      t.includes("ipl") ||
      t.includes("goal") ||
      t.includes("win") ||
      t.includes("defeat")
    ) {
      return "SPORTS";
    }

    // BUSINESS
    if (
      t.includes("business") ||
      t.includes("economy") ||
      t.includes("market") ||
      t.includes("company") ||
      t.includes("stock") ||
      t.includes("finance") ||
      t.includes("investment") ||
      t.includes("revenue") ||
      t.includes("profit") ||
      t.includes("industry")
    ) {
      return "BUSINESS";
    }

    // EDUCATION
    if (
      t.includes("education") ||
      t.includes("school") ||
      t.includes("college") ||
      t.includes("university") ||
      t.includes("student") ||
      t.includes("teacher") ||
      t.includes("admission") ||
      t.includes("course") ||
      t.includes("result")
    ) {
      return "EDUCATION";
    }

    // HEALTH
    if (
      t.includes("health") ||
      t.includes("hospital") ||
      t.includes("medical") ||
      t.includes("doctor") ||
      t.includes("patient") ||
      t.includes("disease") ||
      t.includes("covid") ||
      t.includes("virus") ||
      t.includes("treatment")
    ) {
      return "HEALTH";
    }

    // TECH
    if (
      t.includes("tech") ||
      t.includes("technology") ||
      t.includes("app") ||
      t.includes("software") ||
      t.includes("ai") ||
      t.includes("digital") ||
      t.includes("cyber") ||
      t.includes("internet") ||
      t.includes("phone")
    ) {
      return "TECH";
    }

    // ENTERTAINMENT
    if (
      t.includes("film") ||
      t.includes("movie") ||
      t.includes("actor") ||
      t.includes("actress") ||
      t.includes("celebrity") ||
      t.includes("music") ||
      t.includes("song") ||
      t.includes("entertainment") ||
      t.includes("show")
    ) {
      return "ENTERTAINMENT";
    }

    // ENVIRONMENT
    if (
      t.includes("environment") ||
      t.includes("climate") ||
      t.includes("pollution") ||
      t.includes("weather") ||
      t.includes("flood") ||
      t.includes("rain") ||
      t.includes("cyclone") ||
      t.includes("forest") ||
      t.includes("wildlife")
    ) {
      return "ENVIRONMENT";
    }

    return "OTHER";
  };

  // ================= FILTER NEWS =================
  const filteredNews = news.filter(
    (item) => {
      const text =
        (
          item.title +
          " " +
          (item.summary || "")
        ).toLowerCase();

      // WB
      if (
        filterWB &&
        !isWB(text)
      )
        return false;

      // WORLD
      if (
        filterWorld &&
        !isWorldNews(text)
      )
        return false;

      // STATE
      if (
        state !== "ALL" &&
        !text.includes(
          state.toLowerCase()
        )
      )
        return false;

      // DISTRICT
      if (
        district !== "ALL" &&
        !text.includes(
          district.toLowerCase()
        )
      )
        return false;

      // SEARCH
      if (
        searchText &&
        !text.includes(
          searchText.toLowerCase()
        )
      )
        return false;

      // CATEGORY
      if (newsType !== "ALL") {
        const detected =
          detectNewsType(text);

        if (
          detected !== newsType
        )
          return false;
      }

      // TIME FILTER
      if (
        timeFilter !== "ALL" &&
        item.published_at
      ) {
        const newsTime = new Date(
          item.published_at
        ).getTime();

        const now = Date.now();

        const diffHours =
          (now - newsTime) /
          (1000 * 60 * 60);

        if (
          timeFilter === "1H" &&
          diffHours > 1
        )
          return false;

        if (
          timeFilter === "3H" &&
          diffHours > 3
        )
          return false;

        if (
          timeFilter === "7H" &&
          diffHours > 7
        )
          return false;

        if (
          timeFilter === "1D" &&
          diffHours > 24
        )
          return false;

        if (
          timeFilter === "7D" &&
          diffHours > 168
        )
          return false;

        if (
          timeFilter === "15D" &&
          diffHours > 360
        )
          return false;
      }

      return true;
    }
  );

  // ================= CATEGORY STATS =================
  const categoryStats = {
    CRIME: 0,
    POLITICAL: 0,
    JOB: 0,
    GOVT: 0,
    SPORTS: 0,
    BUSINESS: 0,
    EDUCATION: 0,
    HEALTH: 0,
    TECH: 0,
    ENTERTAINMENT: 0,
    ENVIRONMENT: 0,
    OTHER: 0
  };

  news.forEach(item => {
    const text = item.title + " " + (item.summary || "");
    const type = detectNewsType(text);
    categoryStats[type]++;
  });

  // ================= DISTRICT LIST =================
  const currentDistricts =
    filterWB
      ? stateDistrictMap[
          "West Bengal"
        ] || []
      : stateDistrictMap[
          state
        ] || [];

  // ================= UI =================
  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        @keyframes ripple {
          to {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px currentColor;
          }
          50% {
            box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
      `}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.title}>
              🚨 NEWS COMMAND CENTER
            </div>

            <div style={styles.sub}>
              🛡️ SUPERVISED BY B.DAS | REAL-TIME INTELLIGENCE
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.time}>
              <span style={{ opacity: 0.7 }}>⚡ LAST SYNC:</span> {lastUpdated || "Initializing..."}
            </div>

            <button
              style={styles.refreshBtn}
              onClick={fetchNews}
            >
              🔄 SYNC NOW
            </button>
          </div>
        </div>

        {/* CATEGORY STATS BAR */}
        <div style={styles.statsBar}>
          <div
            style={{
              ...styles.statCard,
              background: newsType === "ALL" ? "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)" : "#1a1a1a",
              cursor: "pointer"
            }}
            onClick={() => {
              setNewsType("ALL");
              setSearchText("");
            }}
          >
            <div style={styles.statLabel}>TOTAL FEED</div>
            <div style={styles.statValue}>{news.length}</div>
          </div>

          {Object.entries({
            CRIME: { icon: "🚔", color: "#ff3b3b" },
            POLITICAL: { icon: "🏛️", color: "#7c3aed" },
            JOB: { icon: "💼", color: "#10b981" },
            GOVT: { icon: "📋", color: "#3b82f6" },
            SPORTS: { icon: "⚽", color: "#f59e0b" },
            BUSINESS: { icon: "💰", color: "#06b6d4" },
            EDUCATION: { icon: "🎓", color: "#8b5cf6" },
            HEALTH: { icon: "🏥", color: "#ec4899" },
            TECH: { icon: "💻", color: "#14b8a6" },
            ENTERTAINMENT: { icon: "🎬", color: "#f97316" },
            ENVIRONMENT: { icon: "🌍", color: "#22c55e" }
          }).map(([type, config]) => (
            <div
              key={type}
              style={{
                ...styles.statCard,
                background: newsType === type 
                  ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}99 100%)`
                  : "#1a1a1a",
                borderLeft: `3px solid ${config.color}`,
                cursor: "pointer",
                opacity: categoryStats[type] === 0 ? 0.5 : 1
              }}
              onClick={() => {
                setNewsType(type);
                setSearchText("");
              }}
            >
              <div style={styles.statLabel}>
                {config.icon} {type}
              </div>
              <div style={styles.statValue}>{categoryStats[type]}</div>
            </div>
          ))}
        </div>

        {/* CONTROL BAR */}
        <div
          style={styles.controlBar}
        >
          {/* STATE */}
          <select
            value={state}
            disabled={
              filterWorld
            }
            onChange={(e) => {
              setState(
                e.target.value
              );

              setDistrict(
                "ALL"
              );

              setSearchText("");

              setNewsType(
                "ALL"
              );

              setTimeFilter(
                "ALL"
              );

              setFilterWorld(
                false
              );
            }}
            style={{
              ...styles.select,
              opacity:
                filterWorld
                  ? 0.5
                  : 1
            }}
          >
            <option value="ALL">
              🗺️ All States
            </option>

            {states.map((s) => (
              <option
                key={s}
                value={s}
              >
                {s}
              </option>
            ))}
          </select>

          {/* DISTRICT */}
          <select
            value={district}
            disabled={
              filterWorld
            }
            onChange={(e) =>
              setDistrict(
                e.target.value
              )
            }
            style={{
              ...styles.select,
              opacity:
                filterWorld
                  ? 0.5
                  : 1
            }}
          >
            <option value="ALL">
              📍 District / City
            </option>

            {currentDistricts.map(
              (d) => (
                <option
                  key={d}
                  value={d}
                >
                  {d}
                </option>
              )
            )}
          </select>

          {/* TIME FILTER */}
          <select
            value={timeFilter}
            onChange={(e) =>
              setTimeFilter(
                e.target.value
              )
            }
            style={styles.select}
          >
            <option value="ALL">
              ⏱️ All Time
            </option>

            <option value="1H">
              Last 1 Hour
            </option>

            <option value="3H">
              Last 3 Hours
            </option>

            <option value="7H">
              Last 7 Hours
            </option>

            <option value="1D">
              Last 1 Day
            </option>

            <option value="7D">
              Last 7 Days
            </option>

            <option value="15D">
              Last 15 Days
            </option>
          </select>

          {/* WB MODE */}
          <button
            style={{
              ...styles.modeBtn,
              background:
                filterWB
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "#1a1a1a",
              boxShadow: filterWB
                ? "0 0 20px #10b98180"
                : "none"
            }}
            onClick={() => {
              setFilterWB(
                (prev) =>
                  !prev
              );

              setFilterWorld(
                false
              );

              setState("ALL");

              setDistrict(
                "ALL"
              );
            }}
          >
            🇮🇳 WB MODE
          </button>

          {/* WORLD MODE */}
          <button
            style={{
              ...styles.modeBtn,
              background:
                filterWorld
                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  : "#1a1a1a",
              boxShadow: filterWorld
                ? "0 0 20px #3b82f680"
                : "none"
            }}
            onClick={() => {
              setFilterWorld(
                (prev) =>
                  !prev
              );

              setFilterWB(
                false
              );

              setState("ALL");

              setDistrict(
                "ALL"
              );
            }}
          >
            🌍 WORLD MODE
          </button>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Search keywords..."
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
            style={styles.search}
          />

          {/* CLEAR FILTER */}
          <button
            style={{
              ...styles.clearBtn
            }}
            onClick={() => {
              setFilterWB(
                false
              );

              setFilterWorld(
                false
              );

              setState("ALL");

              setDistrict(
                "ALL"
              );

              setSearchText(
                ""
              );

              setNewsType(
                "ALL"
              );

              setTimeFilter(
                "ALL"
              );
            }}
          >
            ❌ RESET ALL
          </button>
        </div>

        <div style={styles.live}>
          📡 ACTIVE FEED: {filteredNews.length} ITEMS
          {newsType !== "ALL" && (
            <span style={{ marginLeft: "10px", opacity: 0.8 }}>
              | FILTER: {newsType}
            </span>
          )}
        </div>
      </div>

      {/* NEWS GRID */}
      <div style={styles.grid}>
        {isLoading ? (
          <div
            style={styles.loading}
          >
            <div style={styles.loadingSpinner}>⚡</div>
            SCANNING NETWORKS...
          </div>
        ) : filteredNews.length ===
          0 ? (
          <div
            style={styles.loading}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📭</div>
            NO SIGNALS DETECTED
          </div>
        ) : (
          filteredNews.map(
            (
              item,
              index
            ) => (
              <NewsCard
                key={index}
                item={item}
                detectNewsType={
                  detectNewsType
                }
                timeAgo={
                  timeAgo
                }
              />
            )
          )
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  app: {
    background: "#000000",
    color: "white",
    minHeight: "100vh",
    fontFamily: "'Space Mono', monospace",
    position: "relative"
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: "linear-gradient(180deg, #0a0a0a 0%, #000000 100%)",
    borderBottom: "2px solid #00d4ff",
    padding: "16px",
    boxShadow: "0 4px 24px rgba(0, 212, 255, 0.2)"
  },

  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  title: {
    color: "#00ffcc",
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: "2px",
    textShadow: "0 0 20px #00ffcc80",
    animation: "slideIn 0.5s ease-out"
  },

  sub: {
    color: "#888",
    fontSize: "11px",
    fontWeight: "400",
    letterSpacing: "1px",
    marginTop: "4px"
  },

  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  },

  statCard: {
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    transition: "all 0.3s ease",
    border: "1px solid #2a2a2a"
  },

  statLabel: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1px",
    opacity: 0.9,
    marginBottom: "6px",
    fontFamily: "'Rajdhani', sans-serif"
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    fontFamily: "'Rajdhani', sans-serif"
  },

  controlBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "12px"
  },

  refreshBtn: {
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    color: "#000",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)"
  },

  modeBtn: {
    color: "white",
    border: "1px solid #2a2a2a",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "12px",
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: "1px",
    transition: "all 0.3s ease"
  },

  select: {
    background: "#1a1a1a",
    color: "white",
    border: "1px solid #2a2a2a",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "'Space Mono', monospace",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },

  search: {
    background: "#1a1a1a",
    color: "white",
    border: "1px solid #2a2a2a",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "'Space Mono', monospace",
    flex: "1",
    minWidth: "200px",
    transition: "all 0.3s ease"
  },

  clearBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: "1px",
    transition: "all 0.3s ease"
  },

  time: {
    color: "#ffcc00",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.5px"
  },

  live: {
    color: "#00d4ff",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1px",
    fontFamily: "'Rajdhani', sans-serif",
    animation: "pulse 2s ease-in-out infinite"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
    padding: "20px"
  },

  card: {
    background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },

  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "#00d4ff"
  },

  head: {
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "14px",
    lineHeight: "1.6",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },

  text: {
    color: "#bbb",
    fontSize: "13px",
    marginBottom: "14px",
    lineHeight: "1.7"
  },

  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "12px",
    letterSpacing: "1px",
    fontFamily: "'Rajdhani', sans-serif"
  },

  metaBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #2a2a2a"
  },

  metaItem: {
    color: "#888",
    fontSize: "11px",
    fontWeight: "500"
  },

  hoverIndicator: {
    position: "absolute",
    bottom: "12px",
    right: "16px",
    color: "#00d4ff",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    fontFamily: "'Rajdhani', sans-serif",
    animation: "pulse 1.5s ease-in-out infinite"
  },

  loading: {
    color: "#00d4ff",
    textAlign: "center",
    padding: "60px 40px",
    fontSize: "18px",
    gridColumn: "1 / -1",
    fontWeight: "700",
    letterSpacing: "2px",
    fontFamily: "'Rajdhani', sans-serif"
  },

  loadingSpinner: {
    fontSize: "48px",
    marginBottom: "20px",
    animation: "pulse 1s ease-in-out infinite"
  }
};

export default App;
