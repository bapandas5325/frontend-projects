import React, { useEffect, useState } from "react";

import {
  states,
  stateDistrictMap,
  wbKeywords
} from "./data/geoFilters";

import worldKeywords from "./data/worldKeywords";

// ================= NEWS CARD =================
function NewsCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isHovered ? "#00d4ff" : "#222",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3
        style={styles.head}
        onClick={() => window.open(item.link, "_blank")}
      >
        {item.title}
      </h3>

      {item.summary && (
        <p style={styles.text}>{item.summary}</p>
      )}

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
            ? new Date(item.published_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            : "No Time"}
        </span>
      </div>
    </div>
  );
}

function App() {
  const [news, setNews] = useState([]);
  const [filterWB, setFilterWB] = useState(false);
  const [filterWorld, setFilterWorld] = useState(false);
  const [state, setState] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ================= FETCH NEWS =================
  const fetchNews = () => {
    console.log("🚀 fetchNews CALLED");

    setIsLoading(true);

    fetch("https://news-backend-7tnv.onrender.com/news")
      .then((res) => {
        console.log("STATUS:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("✅ DATA:", data);

        setNews(data);
        setIsLoading(false);

        setLastUpdated(
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
        );
      })
      .catch((err) => {
        console.log("❌ ERROR:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();

    const interval = setInterval(fetchNews, 30000);

    return () => clearInterval(interval);
  }, []);

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

  // ================= FILTER =================
  const filteredNews = news.filter((item) => {
  const text =
    (item.title + " " + (item.summary || "")).toLowerCase();

  if (filterWB && !isWB(text)) return false;

  if (filterWorld && !isWorldNews(text)) return false;

  if (state !== "ALL" && !text.includes(state.toLowerCase()))
    return false;

  if (
    district !== "ALL" &&
    !text.includes(district.toLowerCase())
  )
    return false;

  if (
    searchText &&
    !text.includes(searchText.toLowerCase())
  )
    return false;

  return true;
});




  
    // ================= FILTER =================

  // ================= DISTRICTS =================
  const currentDistricts = filterWB
    ? stateDistrictMap["West Bengal"] || []
    : stateDistrictMap[state] || [];

  // ================= UI =================
  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>
            🚨 News Monitor Dashboard
          </div>

          <div style={styles.sub}>
            🛡️ Developed & Supervised B.Das
            (North Zone)
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.controlBar}>
          <div style={styles.time}>
            🕒 {lastUpdated}
          </div>

          {/* REFRESH */}
          <button
            style={styles.btn}
            onClick={fetchNews}
          >
            🔄 Refresh
          </button>

          {/* STATE */}
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setDistrict("ALL");
            }}
            style={styles.select}
          >
            <option value="ALL">
              All States
            </option>

            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* DISTRICT */}
          <select
            value={district}
            onChange={(e) =>
              setDistrict(e.target.value)
            }
            style={styles.select}
          >
            <option value="ALL">
              District / City
            </option>

            {currentDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* WB MODE */}
          <button
            style={{
              ...styles.btn,
              background: filterWB
                ? "#2e7d32"
                : "#333"
            }}
            onClick={() =>
              setFilterWB(!filterWB)
            }
          >
            🇮🇳 WB Mode
          </button>

          {/* WORLD MODE */}
          <button
            style={{
              ...styles.btn,
              background: filterWorld
                ? "#2e7d32"
                : "#333"
            }}
            onClick={() =>
              setFilterWorld(!filterWorld)
            }
          >
            🌍 World Mode
          </button>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            style={styles.search}
          />
        </div>

        <div style={styles.live}>
          📡 Live Feed ({filteredNews.length}{" "}
          items)
        </div>
      </div>

      {/* NEWS GRID */}
      <div style={styles.grid}>
        {isLoading ? (
          <div style={styles.loading}>
            Loading News...
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={styles.loading}>
            No News Found
          </div>
        ) : (
          filteredNews.map((item, index) => (
            <NewsCard
              key={index}
              item={item}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  app: {
    background: "#0b0b0b",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Arial"
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: "#0b0b0b",
    borderBottom: "1px solid #222",
    padding: "10px"
  },

  title: {
    color: "#00ffcc",
    fontSize: "22px",
    fontWeight: "bold"
  },

  sub: {
    color: "#aaa",
    fontSize: "12px"
  },

  controlBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: "10px"
  },

  btn: {
    background: "#333",
    color: "white",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: "5px"
  },

  select: {
    background: "#1b1b1b",
    color: "white",
    border: "1px solid #444",
    padding: "6px",
    borderRadius: "5px"
  },

  search: {
    background: "#1b1b1b",
    color: "white",
    border: "1px solid #444",
    padding: "6px 10px",
    borderRadius: "5px"
  },

  time: {
    color: "#ffcc00",
    fontSize: "12px"
  },

  live: {
    color: "#00d4ff",
    marginTop: "10px",
    fontSize: "13px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "12px",
    padding: "12px"
  },

  card: {
    background: "#151515",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #222",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },

  head: {
    color: "#00d4ff",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "12px",
    lineHeight: "1.5"
  },

  text: {
    color: "#ccc",
    fontSize: "13px",
    marginBottom: "12px",
    lineHeight: "1.6"
  },

  metaBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #2a2a2a"
  },

  metaItem: {
    color: "#999",
    fontSize: "12px"
  },

  loading: {
    color: "#00d4ff",
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    gridColumn: "1 / -1"
  }
};

export default App;
