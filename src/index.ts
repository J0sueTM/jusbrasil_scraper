import Scraper from "./scraper";
import { ProcPagesSpider, ProcsSpider } from "./spiders";
import Spider from "./spiders/spider";

async function main() {
  const scraper = new Scraper("https://www.jusbrasil.com.br");
  scraper.createCache("cache");

  const spiders: Map<string, Spider> = new Map();
  spiders.set(
    "urls de paginas de processos",
    new ProcPagesSpider(`${scraper.baseUrl}/consulta-processual/busca?q=`)
  );
  spiders.set("processos", new ProcsSpider());
  scraper.setSpiders(spiders);

  await scraper.openBrowser();
  await scraper.scrape();
}

main();
