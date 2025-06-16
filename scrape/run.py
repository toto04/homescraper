from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from camoufox.async_api import AsyncCamoufox
import uvicorn
from contextlib import asynccontextmanager

app = FastAPI(title="Home Scraper API", version="1.0.0")

# Global browser instance
class ScrapedContent(BaseModel):
    listing_id: str
    html_content: str
    url: str

browser = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global browser
    asd = AsyncCamoufox(os=["windows", "macos", "linux"], humanize=True, headless=True)
    browser = await asd.__aenter__()
    yield
    # Shutdown
    if browser:
        await asd.__aexit__(None, None, None)

app = FastAPI(title="Home Scraper API", version="1.0.0", lifespan=lifespan)

@app.get("/scrape/{listing_id}", response_model=ScrapedContent)
async def scrape_listing(listing_id: str):
    """
    Scrape a property listing by ID from immobiliare.it
    """
    try:
        url = f"https://www.immobiliare.it/annunci/{listing_id}/?utm_source=navigator-share&utm_medium=share"
        if not browser:
            raise HTTPException(status_code=500, detail="Browser not initialized")
        if not listing_id:
            raise HTTPException(status_code=400, detail="Listing ID is required")
        
        page = await browser.new_page()
        async with page:
            await page.goto(url)
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(10000)
            content = await page.content()

        return ScrapedContent(
            listing_id=listing_id,
            html_content=content,
            url=url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape listing: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
