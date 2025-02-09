document.addEventListener("DOMContentLoaded", function() {
    const newsContainer = document.getElementById("news-container");
    const loadingText = document.getElementById("loadingText");
    const queryInput = document.getElementById("queryInput");

    function fetchTrendingNews() {
        const query = queryInput.value.trim() || "trending news"; // Default query if empty
        loadingText.style.display = "block";
        newsContainer.innerHTML = ""; // Clear previous results

        fetch(`http://127.0.0.1:8000/api/trending-news/?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                loadingText.style.display = "none";

                if (data.news.length === 0) {
                    newsContainer.innerHTML = "<p>No news found for this topic.</p>";
                    return;
                }

                data.news.forEach(article => {
                    const newsItem = document.createElement("div");
                    newsItem.classList.add("news-item");

                    newsItem.innerHTML = `
                        <a href="${article.link}" target="_blank">${article.title}</a>
                        <p class="news-meta"> ${article.published_date}</p>
                    `;

                    newsContainer.appendChild(newsItem);
                });
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                loadingText.innerText = "Failed to load news.";
            });
    }

    // Fetch default trending news on page load
    fetchTrendingNews();

    // Attach event listener to the search button
    document.querySelector("button").addEventListener("click", fetchTrendingNews);
});