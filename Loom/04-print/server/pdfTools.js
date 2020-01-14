import puppeteer from "puppeteer"


export function generatePdf() {

    puppeteer.launch().then(async browser => {
        const page = await browser.newPage()

        await page.goto("http://localhost:8000/book", {
            waitUntil: "load",
        })

        await page.evaluate(data => {
            const textElement = document.createElement("div")
            textElement.innerText = data.text

            document.body.appendChild(textElement)

            return document.body.getBoundingClientRect().width
        }, {
            text: "hello js content",
        })

        await page.pdf({
            format: "A4",
            landscape: true,
            path: './document.pdf',
        })

        await browser.close()
    })
}
