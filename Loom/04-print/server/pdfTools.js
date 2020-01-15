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

        const pathOfCoverIllustrationDirectory = path.resolve(storeData.tempData.bookDirectory, "cover/illustration")
        const pathOfCoverLayoutDirectory = path.resolve(storeData.tempData.bookDirectory, "cover/layout")



        let arrayOfCover_illustration = []
        let arrayOfCover_layout = []

        try {
            arrayOfCover_illustration = await promises.readdir(pathOfCoverIllustrationDirectory)
        } catch {
            console.info("no illustration cover")
        }

        try {
            arrayOfCover_layout       = await promises.readdir(pathOfCoverLayoutDirectory)
        } catch {
            console.info("no layout cover")
        }

        console.log(arrayOfPages)
        console.log(arrayOfCover_illustration)
        console.log(arrayOfCover_layout)

        const returnedResult = await page.evaluate(dataFromNode => {

            return new Promise(resolve => {
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

                const coverElement = document.querySelector(".cover")

                for(const coverIlluPath of dataFromNode.arrayOfCover_illustration) {
                    const pathIllustrationImage = `${dataFromNode.bookDirectory}/cover/illustration/${coverIlluPath}`

                    const imageElement = document.createElement("img")
                    imageElement.src = pathIllustrationImage

                    imageElement.classList.add("illustration")

                    coverElement.appendChild(imageElement)
                }

                for(const coverLayoutPath of dataFromNode.arrayOfCover_layout) {
                    const pathIllustrationImage = `${dataFromNode.bookDirectory}/cover/layout/${coverLayoutPath}`

                    const imageElement = document.createElement("img")
                    imageElement.src = pathIllustrationImage

                    imageElement.classList.add("layout")

                    coverElement.appendChild(imageElement)
                }


                resolve( arrayToReturn )
            })
        }, {
            bookDirectory: `${bookRoot}/${path.relative("./documents", storeData.tempData.bookDirectory)}`,
            arrayOfPages,
            arrayOfCover_illustration,
            arrayOfCover_layout,
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

    return path.resolve(storeData.tempData.bookDirectory, './document.pdf')
}

function hasPngExtension(element) {
    const extName = path.extname(element)
    return extName === ".png"
}

function hasSvgExtension(element) {
    const extName = path.extname(element)
    return extName === ".svg"
}
