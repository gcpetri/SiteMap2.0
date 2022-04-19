import * as PDFJS from 'pdfjs-dist';
const JSZip = require("jszip");

PDFJS.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.js";

const getText = async (file:File) :Promise<string> => {
  try {
    const loadingTask: PDFJS.PDFDocumentLoadingTask = PDFJS.getDocument(URL.createObjectURL(file));
    const text: string = await loadingTask.promise.then(async (doc:PDFJS.PDFDocumentProxy) => {
      const pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        // @ts-ignore
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
      });
      return (await Promise.all(pageTexts)).join('');
    });
    return text;
  } catch (e:any) {
    return 'ERROR: could not convert pdf to text';
  }
};

export const getPdfText = async (file:File) => {
  return getText(file);
};

const flatenMatches = async (matches:string[]) => {
  const flatMatches: string[] = [];
  await Promise.all(matches.map(async (match:string) => {
    if (Array.isArray(match)) {
      flatMatches.push(...match);
    } else {
      flatMatches.push(match);
    }
  }));
  return flatMatches;
};

const cleanUpGps = (str:string) => {
  const returnStr: string = str.replace(/[^\d^,^.^-]/g, '');
  return (returnStr[0] !== '-') ? returnStr : `-${returnStr}`;
};

export const getRegexMatches = async (regex:RegExp, text:string) => {
  if (!text || text.length === 0) return [];
  const matches: string[] = Array.from(text.matchAll(regex), m => {
    const match: string|string[] = m[0];
    if (Array.isArray(match)) {
      const cleanedMatches: string[] = match.map((m:string) => cleanUpGps(m));
      return cleanedMatches.flat().toString();
    }
    return cleanUpGps(match);
  });
  if (matches.length === 0) return [];
  return flatenMatches(matches);
};

export const getKmlDom = async (text:string) => {
  return new DOMParser().parseFromString(text, "text/xml");
};

export const getDataFromKmz = async (file:File) => {
  const zip = new JSZip();
  const getDataFromKmzPromise = new Promise((resolve, reject) => {
    zip.loadAsync(file).then((content: any) => {
      content.forEach((relPath: string, file: any) => {
        if (relPath.endsWith('.kml')) {
          resolve(file.async("string").then(getKmlDom));
        }
      });
      resolve(null);
    });
  });
  return getDataFromKmzPromise;
};

export const getTagMatches = async (ele:HTMLElement, kmlTags:string[]) => {
  const getDataFromDoc = new Promise((resolve) => {
    let kmlData:string = '';
    kmlTags.forEach((tagName:string) => {
      const xmlItems:any = ele.getElementsByTagName(tagName);
      if ((xmlItems?.length ?? 0) !== 0) {
        Array.from(xmlItems).forEach((item:any) => kmlData += `${item.outerHTML}`);
      }
    });
    resolve(kmlData);
  });
  return getDataFromDoc;
};