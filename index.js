const pptr = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
pptr.use(stealthPlugin())

const {executablePath} = require('puppeteer')

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const browser = await pptr.launch({
    headless: false,
    executablePath: executablePath()
  })

  const page = await browser.newPage()

  let companies = [
    'nike do brasil comércio e participações ltda',
    // 'adidas do brasil ltda',
    // 'puma do brasil ltda',
    // 'reebok produtos esportivos ltda',
    // 'asics brasil, distribuição e comércio de artigos esportivos ltda',
    // 'under armour brasil comércio e distribuição de artigos esportivos ltda'
  ]

  var procs_urls = new Map()
  for await (const company of companies) {
    await page.goto('https://www.jusbrasil.com.br/consulta-processual/')

    await page.type('.LawsuitSearchForm-textField', company)
    await page.keyboard.press('Enter')

    var documents = []
    finished = false
    const disabledNextButtonSelector = 'li.pagination-item.disabled > a[aria-label="Próximo"]'
    const activatedNextButtonSelector = 'li.pagination-item > a[aria-label="Próximo"]'
    while (!finished) {
      await delay(1000)

      let pageDocuments = await page.$$eval('.EntitySnippet-item', elms => {
        return elms.map(elm => {
          return elm.querySelector('.EntitySnippet-header > .EntitySnippet-header-info > .EntitySnippet-anchor-wrapper > a')
            .getAttribute('href')
        })
      })
      documents = documents.concat(pageDocuments)

      const isAtEnd = await page.$$eval(disabledNextButtonSelector, elms => elms)
      if (isAtEnd.length >= 1) {
        finished = true

        break
      }

      await page.waitForSelector(activatedNextButtonSelector, { visible: true })
      await page.click(activatedNextButtonSelector)
    }

    procs_urls.set(company, documents)
  }

  console.log(procs_urls)

  await browser.close()
}

run()