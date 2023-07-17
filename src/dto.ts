import { Browser, Page } from "puppeteer";

interface Proc {
  url: string;
  procNumber: string;
  court: string;
  locality: string;
  uf: string;
  procedure: string;
  parties: string[];
}

interface State {
  browser: Browser;
  page: Page;
  procPages: Map<string, string[]>;
  procs: Map<string, Proc[]>;
}

export default State;
export { Proc };
