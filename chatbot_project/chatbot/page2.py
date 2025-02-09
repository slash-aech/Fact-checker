import requests
from django.http import JsonResponse

def get_trending_news(query):
    api_key = "dd6314030e1d1789cb3cdf6c3d797cb0b63f2ee1382182bcbe99ea4c59d3039d"
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_news",
        "api_key": api_key,
        "q": query,  # Now takes user input
        "num": 10,
        "tbm": "nws"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise error for HTTP issues
        data = response.json()

        trending_news = []
        for article in data.get('news_results', [])[:10]: 
            news_item = {
                "title": article.get('title', 'No title'),
                "link": article.get('link', '#'),
                # "source": article.get('source', 'Unknown'),
                "published_date": article.get('date', 'Unknown')
            }
            trending_news.append(news_item)

        return trending_news
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def trending_news_api(request):
    query = request.GET.get('query', 'latest and trending digital news')
    news = get_trending_news(query)

    if "error" in news:
        return JsonResponse({"message": news["error"]}, status=500)

    return JsonResponse({"news": news})
