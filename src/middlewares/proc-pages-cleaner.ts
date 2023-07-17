import { appState } from "../state";
import Middleware from "./middleware";

class ProcPagesCleanerMiddleware extends Middleware {
  private blockedStrs: string[] = [
    "adyen",
    "petroleo",
    "petrleo",
    "petrolio",
    "system",
    "combustiveis",
    "engenharia",
  ];

  public run() {
    for (const [company, urlsPage] of appState.procPages.entries()) {
      let newCompProcUrls = urlsPage.filter((url: string) => {
        return !this.blockedStrs.some((blockedStr: string) =>
          url.includes(blockedStr)
        );
      });

      appState.procPages.set(company, newCompProcUrls);
    }
  }
}

export default ProcPagesCleanerMiddleware;
