import base64
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from .api import make_query, process_query

API_KEY_CUSTOM_SEARCH = "AIzaSyDSGy9kiTdx_FaXS6KoKfce_Q9SxSQloLI"
API_KEY_VISION = "AIzaSyBT-kDQY5tMoPAsgvJI9ze40NYIB4fko3U"

def fetch_news(query):
    """Fetches news using the Custom Search API"""
    cse_id = "a6324a31740fd477c"
    base_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": cse_id,
        "key": API_KEY_CUSTOM_SEARCH,
        "num": 5,
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        articles = []
        seen_domains = set()
        for item in data.get("items", []):
            link = item.get("link")
            domain = extract_domain(link)
            if domain not in seen_domains:
                seen_domains.add(domain)
                readable_content = extract_readable_content_from_page(link)
                articles.append({
                    "title": item.get("title"),
                    "link": link,
                    "snippet": item.get("snippet"),
                    "domain": domain,
                    "content": readable_content
                })
            if len(articles) >= 5:
                break
        return articles
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
    except KeyError:
        return {"error": "Invalid API response structure."}

def extract_domain(url):
    """Extracts domain from the given URL."""
    parsed_url = urlparse(url)
    return parsed_url.netloc

def extract_readable_content_from_page(url):
    """Extracts readable content from a webpage."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        for non_readable in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe', 'img']):
            non_readable.decompose()
        readable_tags = ['span', 'article', 'p', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'a']
        readable_content = []
        for tag in readable_tags:
            for element in soup.find_all(tag):
                text = element.get_text(strip=True)
                if text:
                    readable_content.append(text)
        full_text = ' '.join(readable_content)
        return truncate_text(full_text, max_words=350)
    except requests.exceptions.RequestException as e:
        return f"Failed to fetch content: {str(e)}"
    except Exception as e:
        return f"Error parsing content: {str(e)}"

def truncate_text(text, max_words):

    """Truncates the text to a given maximum word limit."""
    words = text.split()
    return ' '.join(words[:max_words])

def extract_text_from_image_base64(base64_image):
    """Extracts text from base64 image data using Google Vision API"""
    try:
        url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY_VISION}"
        payload = {
            "requests": [{
                "image": {"content": base64_image},
                "features": [{"type": "TEXT_DETECTION"}]
            }]
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        extracted_text = result.get("responses", [{}])[0].get("textAnnotations", [{}])[0].get("description", "")
        return extracted_text.strip()
    except Exception as e:
        print(f"Vision API Error: {str(e)}")
        return None

@csrf_exempt
def chatbot_query(request):
    """Handles text queries or image uploads from frontend"""
    if request.method == "POST":
        query = request.POST.get('query')
        image_file = request.FILES.get('image')

        # Validate input
        if not query and not image_file:
            return JsonResponse({"message": "Query or Image is required."}, status=400)

        extracted_text = None
        if image_file:
            try:
                # Read and encode the uploaded image file
                image_data = image_file.read()
                base64_image = base64.b64encode(image_data).decode("utf-8")
                extracted_text = extract_text_from_image_base64(base64_image)

                if not extracted_text:
                    return JsonResponse({"message": "No text found in image"}, status=400)

                query = extracted_text  # Use extracted text as query
            except Exception as e:
                return JsonResponse({"message": f"Image processing error: {str(e)}"}, status=500)

        # Process the query (from text input or image)
        try:
            new_query = make_query(query)
            articles = fetch_news(new_query)

            if isinstance(articles, dict) and "error" in articles:
                return JsonResponse({"message": articles["error"]}, status=500)

            if not articles:
                return JsonResponse({"message": "No news found", "query": new_query}, status=404)

            # Prepare response data
            combined_content = ' '.join([f"{a['snippet']} {a['content']}" for a in articles])
            response_from_api = process_query(query, combined_content)

            return JsonResponse({
                "query": query,
                "revised query": new_query,
                "response": response_from_api,
                "urls": [a['link'] for a in articles]
            })

        except Exception as e:
            return JsonResponse({"message": f"Processing error: {str(e)}"}, status=500)

    return JsonResponse({"message": "Only POST requests are supported."}, status=405)