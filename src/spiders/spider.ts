import { Browser, Page } from 'puppeteer'
import * as fs from 'fs'

class Spider {
  protected baseUrl: string
  protected urls: string[] = []

  protected browser: Browser
  protected page: Page

  protected name: string
  protected cacheFilePath: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public setPptr(browser: Browser, page: Page) {
    this.browser = browser
    this.page = page
  }

  protected async crawl() {
    throw new Error('FIXME: crawl não foi implementada')
  }

  protected save() {
    throw new Error('FIXME: save não foi implementada')
  }

  protected load() {
    throw new Error('FIXME: load não foi implementada')
  }

  protected shouldLoad(): boolean {
    return fs.existsSync(this.cacheFilePath)
  }

  public async run(name: string) {
    this.name = name
    this.cacheFilePath = `cache/${this.name.replaceAll(' ', '-')}.json`

    console.info(`Spider >> ${this.name} << inicializada`)

    try {
      console.info('Verificando cache...')
      if (this.shouldLoad()) {
        console.info('Cachê encontrado, extraindo...')

        this.load()
      } else {
        console.info('Cachê não encontrado, extraindo...')
        await this.crawl()

        console.info('Salvando cachê')
        this.save()
      }
    } catch (err: any) {
      console.error(err)
    }

    console.info(`Spider >> ${this.name} << finalizada\n`)
  }
}

export default Spider