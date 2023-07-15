import puppeteer from 'puppeteer-extra'
import { Browser, executablePath, Page } from 'puppeteer'

import Spider from './spiders/spider'
import * as fs from 'fs'

const pptr = puppeteer.use(require('puppeteer-extra-plugin-stealth')())

// helper func
const delay = ms => new Promise(res => setTimeout(res, ms));

class Scraper {
  public baseUrl: string
  private spiders: Map<string, Spider> = new Map()

  // puppeteer
  public browser: Browser
  public page: Page

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public createCache(dirName: string) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: false })
    }
  }

  public async openBrowser() {
    this.browser = await pptr.launch({
      headless: false,
      executablePath: executablePath() || ''
    })

    this.page = await this.browser.newPage()
  }

  public addSpider(spider: Spider, name: string) {
    spider.setPptr(this.browser, this.page)
    this.spiders.set(name, spider)
  }

  public async scrape() {
    console.info('Extração inicializada\n')

    for await (const [name, spider] of this.spiders.entries()) {
      await spider.run(name)
    }

    console.info('Extração finalizada')
  }
}

export default Scraper
export { delay }