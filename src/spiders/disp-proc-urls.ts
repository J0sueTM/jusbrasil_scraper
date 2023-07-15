import * as fs from 'fs'
import { delay } from '../scraper'
import { appState, companies } from '../state'
import Spider from './spider'

class DispProcUrlsSpider extends Spider {
  constructor(baseUrl: string) {
    super(baseUrl)

    for (const company of companies) {
      this.urls.push(`${this.baseUrl}${company.replaceAll(' ', '+')}`)
    }
  }

  protected async crawl() {
    const paginationSlc: string = '.Pagination'
    const disNextBtnSlc: string = 'li.pagination-item.disabled > a[aria-label="Próximo"]'
    const actNextBtnSlc: string = 'li.pagination-item > a[aria-label="Próximo"]'
    for await (const [idx, url] of this.urls.entries()) {
      await appState.page.goto(url)

      let curCompany: string = companies[idx]
      var curProcUrls: string[] = []

      var finished: boolean = false
      while (!finished) {
        await delay(1000)

        let curPageProcUrls = await appState.page.$$eval('.EntitySnippet-item', elms => {
          return elms.map(elm => {
            const selector: string = '.EntitySnippet-header > .EntitySnippet-header-info > .EntitySnippet-anchor-wrapper > a'
 
            return elm.querySelector(selector)?.getAttribute('href')
          })
        })
        curProcUrls = curProcUrls.concat(curPageProcUrls)

        let disNextButton = await appState.page.$$eval(disNextBtnSlc, elms => elms)
        let pagination = await appState.page.$$eval(paginationSlc, elms => elms)
        if (disNextButton.length >= 1 || pagination.length <= 0) {
          finished = true

          break
        }

        await appState.page.waitForSelector(actNextBtnSlc, { visible: true })
        await appState.page.click(actNextBtnSlc)
      }

      appState.dispProcUrls.set(curCompany, curProcUrls)
    }
  }

  protected save() {
    // formatting would be nicer with:
    // const rawData = JSON.stringify(Object.fromEntries(this.dispProcUrls))
    // but I couldn't reverse it.

    const rawData = JSON.stringify(Array.from(appState.dispProcUrls.entries()))
    fs.writeFileSync(this.cacheFilePath, rawData)
  }

  protected load() {
    const rawData = fs.readFileSync(this.cacheFilePath, 'utf8')
    appState.dispProcUrls = new Map(JSON.parse(rawData))
  }
}

export default DispProcUrlsSpider