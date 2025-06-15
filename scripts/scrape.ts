import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker"
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua"

const proxy =
  "socks://scrapingant&proxy_country=IT:0967157a626b486282401c620359a27b@proxy.scrapingant.com:443"

puppeteer.use(StealthPlugin())
puppeteer.use(
  AdblockerPlugin({
    blockTrackersAndAnnoyances: true,
  })
)
puppeteer.use(AnonymizeUAPlugin())

const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    "/home/toto04/projects/homescraper/chrome/linux-139.0.7239.0/chrome-linux64/chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--window-size=1280,800",
    `--proxy-server=${proxy}`,
  ],
})

const page = await browser.newPage()
await page.evaluateOnNewDocument(() => {
  console.debug = console.log = () => {}
})
// await page.setViewport({ width: 1280, height: 800 })
await page.goto("https://www.immobiliare.it/annunci/120443322/", {
  waitUntil: "networkidle2",
  timeout: 10000,
})
await page.screenshot({
  path: "./immobiliare.png",
  fullPage: true,
})
