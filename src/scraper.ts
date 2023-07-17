import puppeteer from "puppeteer-extra";
import { executablePath } from "puppeteer";

import Spider from "./spiders/spider";
import * as fs from "fs";
import { appState } from "./state";

const pptr = puppeteer.use(require("puppeteer-extra-plugin-stealth")());

// helper func
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class Scraper {
  public baseUrl: string;
  private spiders: Map<string, Spider> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public createCache(dirName: string) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: false });
    }
  }

  public async openBrowser() {
    appState.browser = await pptr.launch({
      headless: false,
      executablePath: executablePath() || "",
    });

    appState.page = await appState.browser.newPage();
  }

  public setSpiders(spiders: Map<string, Spider>) {
    this.spiders = spiders;
  }

  public async scrape() {
    console.info("Extração inicializada\n");

    for await (const [name, spider] of this.spiders.entries()) {
      await spider.run(name);
    }

    console.info("Extração finalizada");
  }
}

export default Scraper;
export { delay };
