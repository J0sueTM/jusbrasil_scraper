import Scraper from './scraper'
import { DispProcUrlsSpider } from './spiders'

async function main() {
  const scraper = new Scraper('https://www.jusbrasil.com.br')
  await scraper.openBrowser()

  const dispProcUrlsSpider = new DispProcUrlsSpider(`${scraper.baseUrl}/consulta-processual/busca?q=`)
  scraper.createCache('cache')
  scraper.addSpider(dispProcUrlsSpider, 'urls de processos dispersos')

  scraper.scrape()
}

main()