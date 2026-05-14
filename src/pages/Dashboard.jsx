import { useEffect, useState } from "react";
import API from "../services/api";
import NewsCard from "../components/NewsCard";

export default function Dashboard() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const res = await API.get("/news");
    setNews(res.data);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
