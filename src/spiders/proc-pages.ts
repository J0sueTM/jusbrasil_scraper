import * as fs from "fs";
import { ProcPagesCleanerMiddleware } from "../middlewares";
import { delay } from "../scraper";
import { appState, companies } from "../state";
import Spider from "./spider";

class ProcPagesSpider extends Spider {
  constructor(baseUrl: string) {
    super(baseUrl);

    for (const company of companies) {
      this.urls.push(`${this.baseUrl}${company.replaceAll(" ", "+")}`);
    }

    this.middlewares.push(new ProcPagesCleanerMiddleware());
  }

  protected async crawl() {
    const paginationSlc: string = ".Pagination";
    const disNextBtnSlc: string =
      'li.pagination-item.disabled > a[aria-label="Próximo"]';
    const actNextBtnSlc: string =
      'li.pagination-item > a[aria-label="Próximo"]';
    for await (const [idx, url] of this.urls.entries()) {
      await appState.page.goto(url);

      let curCompany: string = companies[idx];
      var curPages: string[] = [];

      var finished: boolean = false;
      while (!finished) {
        await delay(500);

        let pageUrls = await appState.page.$$eval(
          ".EntitySnippet-item",
          (elms) => {
            return elms.map((elm) => {
              const selector: string =
                ".EntitySnippet-header > .EntitySnippet-header-info > .EntitySnippet-anchor-wrapper > a";

              return elm.querySelector(selector)?.getAttribute("href");
            });
          }
        );
        curPages = curPages.concat(pageUrls);

        let disNextButton = await appState.page.$$eval(
          disNextBtnSlc,
          (elms) => elms
        );
        let pagination = await appState.page.$$eval(
          paginationSlc,
          (elms) => elms
        );
        if (disNextButton.length >= 1 || pagination.length <= 0) {
          finished = true;

          break;
        }

        await appState.page.waitForSelector(actNextBtnSlc, { visible: true });
        await appState.page.click(actNextBtnSlc);
      }

      appState.procPages.set(curCompany, curPages);
      this.middlewares[0].run();
      this.saveCompany(curCompany, curPages);
    }
  }

  protected saveCompany(company: string, data: any[]) {
    const rawData = JSON.stringify(data);
    const destFilePath: string[] = this.cacheFilePath.split("/");
    const filePath: string = `${destFilePath[0]}/${company.replaceAll(" ", "-")}/${destFilePath[1]}`;
    fs.writeFileSync(filePath, rawData);
  }

  protected save() {
    // formatting would be nicer with:
    // const rawData = JSON.stringify(Object.fromEntries(this.dispProcUrls))
    // but I couldn't reverse it.

    const rawData = JSON.stringify(Array.from(appState.procPages.entries()));
    fs.writeFileSync(this.cacheFilePath, rawData);
  }

  protected load() {
    const rawData = fs.readFileSync(this.cacheFilePath, "utf8");
    appState.procPages = new Map(JSON.parse(rawData));
  }
}

export default ProcPagesSpider;
