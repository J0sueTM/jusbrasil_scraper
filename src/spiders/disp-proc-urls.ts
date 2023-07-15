import * as fs from 'fs'
import { delay } from '../scraper'
import Spider from './spider'

class DispProcUrlsSpider extends Spider {
  private procUrls : Map<string, string[]> = new Map()
  private companies: string[] = [
    'nike do brasil comércio e participações ltda',
    'adidas do brasil ltda',
    'puma do brasil ltda',
    'reebok produtos esportivos ltda',
    'asics brasil, distribuição e comércio de artigos esportivos ltda',
    'under armour brasil comércio e distribuição de artigos esportivos ltda'
  ]

  constructor(baseUrl: string) {
    super(baseUrl)

    for (const company of this.companies) {
      this.urls.push(`${this.baseUrl}${company.replaceAll(' ', '+')}`)
    }
  }

  protected async crawl() {
    const paginationSlc: string = '.Pagination'
    const disNextBtnSlc: string = 'li.pagination-item.disabled > a[aria-label="Próximo"]'
    const actNextBtnSlc: string = 'li.pagination-item > a[aria-label="Próximo"]'
    for await (const [idx, url] of this.urls.entries()) {
      await this.page.goto(url)

      let curCompany: string = this.companies[idx]
      var curProcUrls: string[] = []

      var finished: boolean = false
      while (!finished) {
        await delay(1000)

        let curPageProcUrls = await this.page.$$eval('.EntitySnippet-item', elms => {
          return elms.map(elm => {
            const selector: string = '.EntitySnippet-header > .EntitySnippet-header-info > .EntitySnippet-anchor-wrapper > a'
 
            return elm.querySelector(selector)?.getAttribute('href')
          })
        })
        curProcUrls = curProcUrls.concat(curPageProcUrls)

        let disNextButton = await this.page.$$eval(disNextBtnSlc, elms => elms)
        let pagination = await this.page.$$eval(paginationSlc, elms => elms)
        if (disNextButton.length >= 1 || pagination.length <= 0) {
          finished = true

          break
        }

        await this.page.waitForSelector(actNextBtnSlc, { visible: true })
        await this.page.click(actNextBtnSlc)
      }

      this.procUrls.set(curCompany, curProcUrls)
    }
  }

  protected save() {
    // formatting would be nicer with:
    // const rawData = JSON.stringify(Object.fromEntries(this.procUrls))
    // but I couldn't reverse it.

    const rawData = JSON.stringify(Array.from(this.procUrls.entries()))
    fs.writeFileSync(this.cacheFilePath, rawData)
  }

  protected load() {
    const rawData = fs.readFileSync(this.cacheFilePath, 'utf8')
    this.procUrls = new Map(JSON.parse(rawData))
  }
}

export default DispProcUrlsSpider