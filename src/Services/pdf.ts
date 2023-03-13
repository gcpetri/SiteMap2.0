import * as PDFJS from 'pdfjs-dist'
import PreviewMatches from '../types/PreviewMatches'
import { v4 as uuidv4 } from 'uuid'

// The workerSrc property shall be specified.
PDFJS.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.3.122/pdf.worker.js'

//This is where you start
export const getPdfTextByPage = async (file:File): Promise<string[]> => {
  const loadingTask: PDFJS.PDFDocumentLoadingTask = await PDFJS.getDocument(URL.createObjectURL(file))
  const pdf = await loadingTask.promise
  return Promise.all(Array.from({length: pdf.numPages}, (_, i) => i + 1).map(async (i) => handlePage(await pdf.getPage(i))))
}

const handlePage = async (page: PDFJS.PDFPageProxy): Promise<string> => {
  const text = await page.getTextContent()
  const str = text.items.map((token:any) => token.str).join('')
  return str
}

export const getPdfMatchesByPage = (regex: RegExp[], pages: string[]): {
  matches: PreviewMatches,
  highlightedPages: string[],
} => {
  const matches: PreviewMatches = {}
  const highlightedPages: string[] = []

  pages.forEach((p: string, pageNo: number) => {
    regex.forEach(r => {
      const reg: string = r.source

      const newMatches: {
        match: string,
        id: string
      }[] = []

      const newPage = p.replace(
        reg,
        (str: string) => {
          const newMatch: {
            match: string,
            id: string,
          } = {
            match: str,
            id: uuidv4(),
          }
          newMatches.push(newMatch)
          return `<mark id=${newMatch.id}>${newMatch.match}</mark>`
        }
      )
      
      matches[reg][pageNo].push(...newMatches)

      highlightedPages.push(newPage)
    })
  })

  return {
    matches,
    highlightedPages
  }
}