import { Browser, Page } from "puppeteer"

interface State {
  browser: Browser
  page: Page
  dispProcUrls: Map<string, string[]>
  procUrls: Map<string, string[]>
}

const appState: State = {
  dispProcUrls: new Map(),
  procUrls: new Map()
} as State

const companies: string[] = [
  'nike do brasil comércio e participações ltda',
  'adidas do brasil ltda',
  'puma do brasil ltda',
  'reebok produtos esportivos ltda',
  'asics brasil, distribuição e comércio de artigos esportivos ltda',
  'under armour brasil comércio e distribuição de artigos esportivos ltda'
]

export default State
export { appState, companies }