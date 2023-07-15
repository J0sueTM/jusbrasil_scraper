// import { appState } from "../state";
import Spider from "./spider";

class ProcUrlsSpider extends Spider {
  constructor() {
    super('')
  }

  protected async crawl() {
    console.log('buceta')
    // for await (const [company, procUrl] of appState.dispProcUrls.entries()) {

    // }
  }

  protected save() {
  }

  protected load() {
  }
}

export default ProcUrlsSpider