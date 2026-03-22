import os
import httpx
import base64
import asyncio

async def test_spotify():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("Missing credentials")
        return

    creds = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {creds}"},
            data={"grant_type": "client_credentials"},
        )
        print(f"Auth Status: {r.status_code}")
        print(f"Auth Response: {r.text}")
        token = r.json().get("access_token")
        if not token:
            print("Failed to get token")
            return
        print(f"Token: {token[:10]}...")

        # Test 1: Search without limit
        r1 = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": "year:1980-1989", "type": "track"}
        )
        print(f"Search 1 (no limit): {r1.status_code}")

        # Test 2: Search with limit="20"
        r2 = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": "year:1980-1989", "type": "track", "limit": "20"}
        )
        print(f"Search 2 (limit='20'): {r2.status_code}")

        # Test 3: Search with limit=20
        r3 = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": "year:1980-1989", "type": "track", "limit": 20}
        )
        print(f"Search 3 (limit=20): {r3.status_code}")

if __name__ == "__main__":
    asyncio.run(test_spotify())
