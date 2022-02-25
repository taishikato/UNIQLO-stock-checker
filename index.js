const puppeteer = require('puppeteer')
const url = 'https://www.uniqlo.com/ca/en/products/E446359-000?colorCode=COL09&sizeCode=SMA003'
const mailgun = require('mailgun-js')({
  apiKey: 'your-mailgun-api-key',
  domain: 'your-email-domain',
})

;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForSelector('.contained', { timeout: 2000 })

    const productData = await page.evaluate(() => {
      return {
        name: document.getElementsByClassName('description fr-no-uppercase')[0].innerHTML,
        annotation: document.getElementsByClassName('fr-text-annotation')[0].innerHTML.replace('&nbsp;', ''),
      }
    })

    await browser.close()

    // Send an email
    await mailgun.messages().send(
      {
        from: 'UNIQLO Stock Checker <anything@your-email-domain>',
        to: ['your-email-address'],
        subject: productData.name || 'UNIQLO Checker',
        text: `${productData.annotation === 'In Stock' ? '在庫あるよ' : '在庫ないよ'}\n${url}`,
      },
      (err, body) => {
        console.log(body)
        if (err) {
          console.error(err)
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
})()
