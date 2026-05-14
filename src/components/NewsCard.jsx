export default function NewsCard({ item }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h2 className="text-lg font-bold text-white">
        {item.title}
      </h2>

      <p className="text-slate-300 mt-2">
        {item.summary}
      </p>

      <a
        href={item.link}
        target="_blank"
        className="bg-red-600 px-3 py-2 rounded text-white inline-block mt-3"
      >
        Open Article
      </a>
    </div>
  );
}
