import * as PDFJS from 'pdfjs-dist'
import { v4 as uuid } from 'uuid'
// const JSZip = require("jszip");

// PDFJS.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.js"

const getText = async (file:File): Promise<string> => {
  try {
    const loadingTask: PDFJS.PDFDocumentLoadingTask = PDFJS.getDocument(URL.createObjectURL(file))
    const text: string = await loadingTask.promise.then(async (doc:PDFJS.PDFDocumentProxy) => {
      const pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        // @ts-ignore
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('')
      });
      return (await Promise.all(pageTexts)).join('')
    });
    return text
  } catch (e:any) {
    return 'ERROR'
  }
};

export const getPdfText = async (file:File) => {
  return getText(file)
}

export const cleanUpGps = (str:string): string => {
  const returnStr: string = str.replace(/[^\d^,^.^-]/g, '')
  return (returnStr[0] !== '-') ? returnStr : `-${returnStr}`
}

export const getKmlDom = async (text:string) => {
  return new DOMParser().parseFromString(text, "text/xml");
}

export const getDataFromKmz = async (file:File) => {
  const zip = {} // new JSZip();
  const dataObj: any = {
    'kml': null,
    'files': [],
  };
  // await zip.loadAsync(file).then(async (content: any) => {
  //   // @ts-ignore
  //   await Promise.all(Object.entries(content.files).map(async ([name, file]) => {
  //     return new Promise(async (resolve) => {
  //       if (name.endsWith('.kml')) {
  //         // @ts-ignore
  //         resolve(dataObj['kml'] = await file.async("string").then(getKmlDom));
  //       }
  //       if (name.endsWith('.PNG') || name.endsWith('.png')) {
  //         resolve(await dataObj['files'].push(file));
  //       }
  //     });
  //   }));
  // });
  return dataObj;
};

export const getTagMatches = async (ele:HTMLElement, kmlTags:string[]) => {
  let kmlData:string = '';
  await Promise.all(kmlTags.map(async (tagName:string) => {
    return new Promise(async (resolve) => {
      let newKmlDataItem: string = '';
      const xmlItems:any = ele.getElementsByTagName(tagName);
      if ((xmlItems?.length ?? 0) !== 0) {
        await Promise.all(Array.from(xmlItems).map(async (item:any) => new Promise((resolve2) => {
          item.setAttribute('id', uuid());
          item.removeAttribute('xmlns');
          // eslint-disable-next-line no-useless-escape
          resolve2(newKmlDataItem += `${item.outerHTML}`); // .replace(/xmlns(:gx)?=\"(.*?)\"/gm, ''));
        })));
        resolve(kmlData += newKmlDataItem);
      }
      resolve('');
    });
  }));
  return kmlData;
};