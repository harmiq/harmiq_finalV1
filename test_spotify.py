import httpx
import asyncio
import os

SPOTIFY_CLIENT_ID = "6971b826b6fb43e09153530e9d84bae0"
SPOTIFY_CLIENT_SECRET = "deaa9f18f11f481292905af9e57442b1"

async def test_spotify():
    async with httpx.AsyncClient() as client:
        print("Obteniendo token...")
        r = await client.post(
            "https://accounts.spotify.com/api/token",
            data={"grant_type": "client_credentials"},
            auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        )
        if r.status_code != 200:
            print(f"Error Token: {r.status_code} {r.text}")
            return
        
        token = r.json().get("access_token")
        print(f"Token obtenido: {token[:10]}...")
        
        print("Probando búsqueda (Thriller)...")
        r = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": "Thriller", "type": "track", "limit": 1}
        )
        print(f"Resultado Búsqueda: {r.status_code} {r.text[:200]}")

if __name__ == "__main__":
    asyncio.run(test_spotify())
