import puppeteer from "puppeteer"
import {promises} from "fs"
import {storeData} from "./index.js"
import path from "path"

export function generatePdf() {

    const bookRoot = "book"

    puppeteer.launch().then(async browser => {
        const page = await browser.newPage()

        await page.goto(`http://localhost:8000/${bookRoot}`, {
            waitUntil: "load",
        })

        const arrayOfElementsInBookDirectory = await promises.readdir(storeData.tempData.bookDirectory)

        const arrayOfPages = arrayOfElementsInBookDirectory.filter(value => {
            return hasPngExtension(value) | hasSvgExtension(value)
        })

        console.log(arrayOfPages)

        const returnedResult = await page.evaluate(dataFromNode => {

            const arrayToReturn = []

            for(const imagePath of dataFromNode.arrayOfPages) {

                const pathInDirectory = `${dataFromNode.bookDirectory}/${imagePath}`

                const imageElement = document.createElement("img")
                imageElement.src = pathInDirectory

                const page = document.createElement("div")
                page.classList.add("page")

                page.appendChild(imageElement)

                document.body.appendChild(page)

                arrayToReturn.push(pathInDirectory)
            }

            return arrayToReturn
        }, {
            bookDirectory: `${bookRoot}/${path.relative("./documents", storeData.tempData.bookDirectory)}`,
            arrayOfPages,
        })

        console.log(returnedResult)

        setTimeout(async () => {
            await page.pdf({
                format: "A4",
                landscape: true,
                path: path.resolve(storeData.tempData.bookDirectory, './document.pdf'),
                printBackground: true,
            })

            console.log(await page.content())


            await browser.close()
        }, 500)
    })
}

function hasPngExtension(element) {
    const extName = path.extname(element)
    return extName === ".png"
}

function hasSvgExtension(element) {
    const extName = path.extname(element)
    return extName === ".svg"
}
