import * as fs from "fs";
import { Proc } from "../dto";
import { appState } from "../state";
import Spider from "./spider";

const cliProgress = require("cli-progress");

class ProcsSpider extends Spider {
  constructor() {
    super("");
  }

  protected async crawl() {
    for await (const [company, page] of appState.procPages.entries()) {
      console.info(`Extraindo processos de ${company}...`);

      const progressBar = new cliProgress.MultiBar(
        {
          clearOnComplete: false,
          hideCursor: true,
          format: "{bar} >> {pagename} << {value}/{total}",
        },
        cliProgress.Presets.shades_classic
      );

      const compBar = progressBar.create(page.length, 0);

      var procs: Proc[] = [];
      for await (const [idx, url] of page.entries()) {
        await appState.page.goto(url);

        let isPageUnavailable = await appState.page.evaluate(() => {
          const elms = Array.from(document.querySelectorAll("*"));
          return elms.some((elm) =>
            elm.textContent?.includes("Página não encontrada")
          );
        });

        if (isPageUnavailable) {
          continue;
        }

        const procCountSlc: string =
          ".navbar-link.active > h2.navinline > span";
        let totalPageProcCount: number = await appState.page.$eval(
          procCountSlc,
          (elm) => +elm.textContent
        );
        const pageBar = progressBar.create(totalPageProcCount, 0);

        var curPageProcs: Proc[] = [];
        var curPageProcCount: number = 0;
        while (curPageProcCount < totalPageProcCount) {
          await appState.page.evaluate(() => {
            window.scrollTo({ top: document.body.scrollHeight });
          });

          curPageProcs = await appState.page.$$eval(
            ".LawsuitList-item",
            (elms) => {
              return elms.map((elm) => {
                const procUrlSlc: string =
                  "a.LawsuitCardPersonPage-title--link";
                const procNumSlc: string =
                  "span.LawsuitCardPersonPage-header-processNumber";
                const procCourtAndLocalitySlc: string =
                  'p.LawsuitCardPersonPage-body-row-item-text[role="body-court"]';
                const procProcedureSlc: string =
                  'p.LawsuitCardPersonPage-body-row-item-text[role="body-kind"]';
                const procPartiesSlc: string =
                  "strong.LawsuitCardPersonPage-header-processInvolved";

                const procUrl: string =
                  elm.querySelector(procUrlSlc)?.getAttribute("href") ??
                  "Indisponível";
                const procNum: string =
                  elm
                    .querySelector(procNumSlc)
                    ?.textContent.replace("Processo nº ", "") ?? "Indisponível";
                const procCourtAndLocality: string[] = elm
                  .querySelector(procCourtAndLocalitySlc)
                  ?.textContent?.split(" · ") ?? [
                  "Indisponível",
                  "Indisponível",
                ];
                const procProcedure: string =
                  elm.querySelector(procProcedureSlc)?.textContent ??
                  "Indisponível";
                const procParties: string[] = elm
                  .querySelector(procPartiesSlc)
                  ?.textContent?.split("x")

                const procCourt: string = procCourtAndLocality[0];
                var procLocality: string = procCourtAndLocality[1];
                var procUF: string = procCourt?.slice(-2) ?? "Indisponível";
                if (procCourtAndLocality[1] !== "Indisponível") {
                  procLocality = procCourtAndLocality[1] ?? "Indisponível";
                  procUF = procLocality?.split(",")[1]?.slice(1) ?? "Indisponível";
                }

                // clean parties names' blank spaces
                procParties[0] =
                  procParties[0] === undefined
                    ? "Indisponível"
                    : procParties[0]?.slice(0, -1);

                procParties[1] =
                  procParties[1] === undefined
                    ? "Indisponível"
                    : procParties[1]?.slice(1);

                const proc: Proc = {
                  url: procUrl,
                  procNumber: procNum,
                  court: procCourt,
                  locality: procLocality,
                  uf: procUF,
                  procedure: procProcedure,
                  parties: procParties,
                } as Proc;

                return proc;
              });
            }
          );

          curPageProcCount = curPageProcs.length;
          pageBar.update(curPageProcCount, { pagename: `Página ${idx + 1}` });
        }

        procs = procs.concat(curPageProcs);

        progressBar.remove(pageBar);
        compBar.update(idx + 1, { pagename: company.split(" ")[0] });
      }

      progressBar.stop();

      console.info(`Total extraído: ${procs.length}\n`);

      appState.procs.set(company, procs);
    }
  }

  protected save() {
    const rawData = JSON.stringify(Array.from(appState.procs.entries()));
    fs.writeFileSync(this.cacheFilePath, rawData);

    // Array.from generates parseable but unusable (by humans) data
    const humanizedRawData = JSON.stringify(Object.fromEntries(appState.procs));
    fs.writeFileSync(
      `${this.cacheFilePath.replace(".json", "")}-human.json`,
      humanizedRawData
    );
  }

  protected load() {
    const rawData = fs.readFileSync(this.cacheFilePath, "utf8");
    appState.procs = new Map(JSON.parse(rawData));
  }
}

export default ProcsSpider;
