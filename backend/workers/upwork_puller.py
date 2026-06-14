import os
import json
import re
import html
import feedparser
import requests

# Configuration via environment variables with safe fallbacks
# Note: Upwork discontinued native RSS feeds on August 20, 2024.
# WeWorkRemotely provides a fully functional, public RSS feed of active programming jobs.
RSS_FEEDS = {
    "weworkremotely": os.environ.get(
        "WEWORKREMOTELY_RSS_URL",
        "https://weworkremotely.com/categories/remote-programming-jobs.rss"
    ),
    "upwork": os.environ.get("UPWORK_RSS_URL")
}

LEADS_API_KEY = os.environ.get("LEADS_API_KEY", "seven_secret_leads_key")
API_URL = os.environ.get("API_URL", "http://127.0.0.1:8080")
CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seen_jobs.json")

def clean_html(raw_html):
    """Clean HTML tags and unescape HTML entities from RSS summaries."""
    if not raw_html:
        return ""
    # Strip HTML tags
    clean_text = re.sub(r'<[^>]+>', '', raw_html)
    # Unescape HTML entities
    clean_text = html.unescape(clean_text)
    # Clean up excess whitespace
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text

def extract_budget(summary):
    """Extract Budget or Hourly Rate information from description if present."""
    budget_match = re.search(r'Budget\s*:\s*\$([0-9,]+)', summary, re.IGNORECASE)
    if budget_match:
        return f"Budget: ${budget_match.group(1)}"
    
    hourly_match = re.search(r'Hourly Range\s*:\s*\$([0-9.]+)-\$([0-9.]+)', summary, re.IGNORECASE)
    if hourly_match:
        return f"Hourly: ${hourly_match.group(1)} - ${hourly_match.group(2)}"
    
    return "Not Specified"

def load_seen_jobs():
    """Load deduplication cache of previously seen job links."""
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return set(json.load(f))
        except Exception as e:
            print(f"[CACHE] Error loading cache file: {e}")
    return set()

def save_seen_jobs(seen_set):
    """Save deduplication cache back to the JSON file."""
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(list(seen_set), f, indent=2)
    except Exception as e:
        print(f"[CACHE] Error saving cache file: {e}")

def run_puller():
    seen_jobs = load_seen_jobs()
    new_jobs_count = 0

    for source_name, feed_url in RSS_FEEDS.items():
        if not feed_url:
            continue
        print(f"[WORKER] Fetching {source_name} RSS from: {feed_url}")
        
        try:
            # RSS feeds can sometimes block simple python-requests User-Agents,
            # so we use a modern browser User-Agent header.
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
            res = requests.get(feed_url, headers=headers, timeout=15)
            if res.status_code != 200:
                print(f"[WORKER] Error: Failed to fetch feed from {feed_url}. Status: {res.status_code}")
                continue
                
            feed = feedparser.parse(res.content)
        except Exception as e:
            print(f"[WORKER] Error fetching/parsing feed {source_name}: {e}")
            continue
            
        if feed.bozo:
            print(f"[WORKER] Warning: Feed parsing issue for {source_name}. Bozo exception: {feed.bozo_exception}")
            # If the feed parsing has an issue, only continue if there are entries parsed successfully
            if not feed.entries:
                print(f"[WORKER] Skipping {source_name} due to empty or invalid feed entries.")
                continue

        for entry in feed.entries:
            job_id = entry.get("id") or entry.get("link")
            if not job_id:
                continue
                
            if job_id in seen_jobs:
                continue
                
            title = entry.get("title", f"Untitled {source_name} Job")
            link = entry.get("link", "#")
            summary_raw = entry.get("summary") or entry.get("description") or ""
            
            summary_clean = clean_html(summary_raw)
            budget_info = extract_budget(summary_raw)
            
            # Extract client name and project title if title contains ":" (standard for WeWorkRemotely)
            client_name = f"{source_name.capitalize()} Client"
            project_title = title
            if ":" in title:
                parts = title.split(":", 1)
                client_name = parts[0].strip()
                project_title = parts[1].strip()
            
            print(f"[NEW LEAD] Found Client: {client_name} | Project: {project_title}")
            
            # Prepare webhook payload structure
            entry_dict = {
                "title": title,
                "link": link,
                "description": summary_clean,
                "budget": budget_info
            }
            
            payload = {
                "source": f"{source_name}_rss",
                "raw_payload": entry_dict,
                "normalized_data": {
                    "name": client_name,
                    "industry": project_title,
                    "url": link
                }
            }
            
            # Post to the leads ingestion webhook endpoint
            webhook_url = f"{API_URL.rstrip('/')}/api/v1/leads/ingest"
            headers = {
                "X-API-Key": LEADS_API_KEY,
                "Content-Type": "application/json"
            }
            
            try:
                res = requests.post(webhook_url, json=payload, headers=headers, timeout=10)
                if res.status_code == 200:
                    print(f"[INGEST] Lead successfully ingested: {res.json()}")
                    seen_jobs.add(job_id)
                    new_jobs_count += 1
                else:
                    print(f"[INGEST] Failed to ingest lead. Status: {res.status_code}, Response: {res.text}")
            except Exception as e:
                print(f"[INGEST] Error posting lead to webhook: {e}")

    if new_jobs_count > 0:
        save_seen_jobs(seen_jobs)
        print(f"[WORKER] Completed. Ingested {new_jobs_count} new leads.")
    else:
        print("[WORKER] Completed. No new leads found.")

if __name__ == "__main__":
    run_puller()
