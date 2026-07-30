import urllib.request
import time
import sys

SERVICES = {
    "frontend": "http://localhost:3000/health",
    "backend": "http://localhost:5000/health",
    "ai": "http://localhost:8000/health"
}

def check_health(name, url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                print(f"[OK] {name} is healthy")
                return True
            else:
                print(f"[FAIL] {name} returned status {response.status}")
                return False
    except Exception as e:
        print(f"[FAIL] {name} failed: {str(e)}")
        return False

def main():
    print("Running Health Checks...")
    all_healthy = True
    for name, url in SERVICES.items():
        if not check_health(name, url):
            all_healthy = False
            
    if all_healthy:
        print("All services are healthy.")
        sys.exit(0)
    else:
        print("Health check failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
