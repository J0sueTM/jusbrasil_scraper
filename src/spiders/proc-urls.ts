// import { delay } from '../scraper'
import * as fs from 'fs'
import { appState } from "../state"
import Spider from "./spider"

const cliProgress = require('cli-progress')

class ProcUrlsSpider extends Spider {
  constructor() {
    super('')
  }

  protected async crawl() {
    const procCountSlc: string = '.navbar-link.active > h2.navinline > span'

    for await (const [company, page] of appState.procPages.entries()) {
      console.info(`Extraindo urls de ${company}...`)

      const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
      bar.start(page.length, 0)

      var procUrls: string[] = []
      for await (const [idx, url] of page.entries()) {
        await appState.page.goto(url)

        const isPageUnavailable = await appState.page.evaluate(() => {
          const elms = Array.from(document.querySelectorAll('*'))
          return elms.some(elm => elm.innerHTML.includes('Página não encontrada'))
        })
        if (isPageUnavailable) { continue }

        let totalPageProcUrlCount: number = await appState.page.$eval(procCountSlc, elm => +elm.textContent)
        var curPageProcUrlCount: number = 0
        var curPageProcUrls: string[] = []
        while (curPageProcUrlCount < totalPageProcUrlCount) {
          await appState.page.evaluate(() => {
            window.scrollTo({ top: document.body.scrollHeight })
          })

          let procUrls = await appState.page.$$eval('.LawsuitList-item', elms => {
            return elms.map(elm => {
              const selector: string = 'a.LawsuitCardPersonPage-title--link'

              return elm.querySelector(selector)?.getAttribute('href')
            })
          })
          curPageProcUrls = procUrls

          curPageProcUrlCount = procUrls.length
        }

        procUrls = procUrls.concat(curPageProcUrls)

        bar.update(idx + 1)
      }

      console.info(`Total: ${procUrls.length}\n`)
      bar.stop()

      appState.procUrls.set(company, procUrls)
    }
  }

  protected save() {
    const rawData = JSON.stringify(Array.from(appState.procUrls.entries()))
    fs.writeFileSync(this.cacheFilePath, rawData)
  }

  protected load() {
  }
}

export default ProcUrlsSpider