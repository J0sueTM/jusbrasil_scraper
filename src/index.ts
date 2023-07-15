import Scraper from './scraper'
import {
  DispProcUrlsSpider,
  ProcUrlsSpider
} from './spiders'
import Spider from './spiders/spider'

async function main() {
  const scraper = new Scraper('https://www.jusbrasil.com.br')
  scraper.createCache('cache')

  const spiders: Map<string, Spider> = new Map()
  spiders.set('urls de processos dispersos', new DispProcUrlsSpider(`${scraper.baseUrl}/consulta-processual/busca?q=`))
  spiders.set('urls de processos', new ProcUrlsSpider())
  scraper.setSpiders(spiders)

  await scraper.openBrowser()
  await scraper.scrape()
}

main()