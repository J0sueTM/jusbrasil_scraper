import * as fs from "fs";
import { Parser } from "json2csv";
import { appState } from "../state";
import Middleware from "./middleware";

class ProcParserMiddleware extends Middleware {
  private opts = {
    fields: ["url", "procNumber", "locality", "uf", "procedure", "parties"],
  };

  public run() {
    try {
      const parser = new Parser(this.opts);

      for (const [company, procs] of appState.procs) {
        let newProcs = procs.map((proc) => {
          if (proc.procNumber.includes("Processo") || proc.procNumber.includes("Indisponível")) {
            proc.procNumber = proc.url?.split("processo-n-")[1]?.slice(0, 21)?.replaceAll('-', '.');
          }

          return proc;
        })
        appState.procs.set(company, newProcs)

        const parsedCsv = parser.parse(newProcs);

        fs.writeFileSync(`cache/${company.replaceAll(" ", "-")}/processos.csv`, parsedCsv);
      }
    } catch (err) {
      console.error(`Não foi possível gerar o CSV :: ${err}`);
    }
  }
}

export default ProcParserMiddleware;
