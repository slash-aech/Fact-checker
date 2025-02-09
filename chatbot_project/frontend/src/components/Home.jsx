import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("trending news"); // Default query if none entered
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const routeChat = () => {
    navigate("/chat");
  };

  // Fetch news function
  const fetchTrendingNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/trending-news/?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      // Ensure we only set news items that have some content
      setNews(data.news ? data.news.filter(article => article.title || article.snippet) : []);
    } catch (err) {
      setError("Failed to load news.");
    }

    setLoading(false);
  };

  // Fetch news on component mount
  useEffect(() => {
    fetchTrendingNews();
  }, []);

  return (
    <>
      {/* Navbar */}
      <div className="flex justify-around p-4 bg-gray-700 text-orange-600">
        <div>Fact Checker</div>
        <div className="flex gap-3">
          <div>Login</div>
          <div>Register</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col bg-gray-800 text-white min-h-screen p-5 gap-3 items-center">
        <div className="text-7xl text-center mb-3">Know Your News</div>
        <div className="text-center text-xl text-yellow-300">
          Get your facts straight with our state-of-the-art AI
        </div>
        {/* Chat Button */}
        <button 
          onClick={routeChat} 
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-400 
                     text-black font-semibold text-lg shadow-md transition-all 
                     hover:from-orange-600 hover:to-yellow-500 hover:scale-105 
                     active:scale-95 active:from-orange-700 active:to-yellow-600"
        >
          Join the Chat
        </button>

        {/* Trending News Card */}
        <div className="bg-gray-700 w-[400px] p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center text-orange-500 mb-3">Trending News</h2>

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter topic (e.g., AI, politics, sports)"
              className="p-2 rounded-md bg-gray-600 text-white w-full focus:ring-2 focus:ring-orange-500"
            />
            <button 
              onClick={fetchTrendingNews} 
              className="px-3 py-2 bg-orange-500 rounded-md hover:bg-orange-400"
            >
              Search
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <p className="text-yellow-300 text-center">Fetching latest news...</p>
          )}

          {/* Error Message */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* News List */}
          <div>
            {news.length > 0 ? (
              news.map((article, index) => (
                <div key={index} className="mb-3 border-b border-gray-600 pb-2">
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline"
                  >
                    {article.title ? article.title : (article.snippet ? article.snippet : "No Title Available")}
                  </a>
                  <p className="text-sm text-gray-300">
                    {article.published_date ? article.published_date : "Date not available"}
                  </p>
                </div>
              ))
            ) : (
              !loading && <p className="text-gray-400 text-center">No news found for this topic.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
