/* eslint-disable no-restricted-globals */
import { getDataFromKmz, getPdfText, getRegexMatches, getTagMatches } from "../Services/scrapper";
import { generateKmlFile } from "../Services/kml";
import { v4 as uuid } from 'uuid';
import JSZip from "jszip";
// const JSZip = require("jszip");

// generate a recursive file iterator
async function* getFilesRecursively(path:string, entry:FileSystemDirectoryHandle): AsyncIterable<[string,File]> {
  // tslint:disable-next-line await-promise
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const [name, handle] of entry) {
    if (handle.kind === 'file') { // it is a file
      const newPath: string = path.length === 0 ? name : `${path}/${name}`;
      const file: File = await handle.getFile();
      yield [newPath, file];
    }
    else { // it is a directory
      const newPath: string = path.length === 0 ? handle.name : `${path}/${handle.name}`;
      yield* getFilesRecursively(newPath, handle);
    }
  }
};

onmessage = async (e:any) => {
  console.log(e.data);
  postMessage('starting...');
  const dirHandle = e.data[0];
  const regexExp = e.data[1];
  const kmlTags = e.data[2];
  const _DOMParser = e.data[3];

  console.log('iterating...');
  // loop through all files and add to data object
  const iterator: AsyncIterable<[string,File]> = getFilesRecursively('', dirHandle);

  const dataObj: any = {};
  const styleIds: string[] = [];
  const styleMapIds: string[] = [];
  dataObj['styles'] = [];
  dataObj['style-maps'] = [];

  const zip = new JSZip();
  for await (let value of iterator) {
    const name: string = value[0];
    const file: File = value[1];
    if ((file.type === 'application/pdf' || file.name.endsWith('.pdf'))
      && regexExp !== null) { // Scrape PDF
      postMessage(name);
      try {
        const pdfText: string = await getPdfText(file);
        const regexMatches: string[] = await getRegexMatches(regexExp, pdfText);
        dataObj[name] = regexMatches;
      } catch (e:any) {
        console.log(e);
        dataObj[name] = '$ERROR$';
      }
    } else if ((file.type === 'application/vnd.google-earth.kmz' || file.name.endsWith('.kmz')) 
      && kmlTags.length > 0) { // Scrape KMZ
      postMessage(name);
      try {
        // main point: get Points, GroundOverlays, etc.
        const kmlObj:any = await getDataFromKmz(file, _DOMParser);
        if (kmlObj === null) throw new Error('kmz object');

        const kmlDoc: Document|any = kmlObj['kml']; // kml document
        const kmlFiles: any[] = kmlObj['files']; // image files

        const ele: HTMLElement|null = kmlDoc.getElementsByTagName('Document')[0];
        if (ele === null || ele === undefined) throw new Error('Document undefined');

        // add files to the zip
        const fileNameMap:any = {};
        if ((kmlFiles?.length ?? 0) !== 0) {
          await Promise.all(kmlFiles.map(async (image:any) => {
            return new Promise(async (resolve) => {
              const newImageName: string = `files/img-${uuid()}.png`;
              fileNameMap[image.name] = newImageName;
              resolve(zip.file(newImageName, image.async("uint8array")));
            });
          }));
        }

        // add any additional styles required
        const styleXmlItems:any = ele?.getElementsByTagName('Style');
        if ((styleXmlItems?.length ?? 0) !== 0) {
          const newStyleItems: string[] = [];
          await Promise.all(Array.from(styleXmlItems).map(async (item:any) => {
            return new Promise(async (resolve) => {
              if ((item?.id?.length ?? 0) !== 0 && styleIds.indexOf(item.id) === -1) {
                let styleStr: string = `${item.outerHTML}`;
                // @ts-ignore
                await Promise.all(Object.entries(fileNameMap).map(async ([originalImageName, newImageName]) => {
                  return new Promise((resolve2) => {
                    // @ts-ignore
                    resolve2(styleStr = styleStr.replace(originalImageName, newImageName));
                  });
                }));
                styleIds.push(item.id);
                resolve(newStyleItems.push(styleStr));
              } else {
                resolve('');
              }
            });
          }));
          dataObj['styles'] = [...dataObj['styles'], newStyleItems];
        }

        // add any additional style maps required
        const styleMapXmlItems:any = ele?.getElementsByTagName('StyleMap');
        if ((styleMapXmlItems?.length ?? 0) !== 0) {
          await Promise.all(Array.from(styleMapXmlItems).map(async (item:any) => {
            return new Promise((resolve) => {
              if ((item?.id?.length ?? 0) !== 0 && styleMapIds.indexOf(item.id) === -1) {
                styleMapIds.push(item.id);
                resolve(dataObj['style-maps'].push(`${item.outerHTML}`));
              } else {
                resolve('');
              }
            });
          }));
        }

        // get kml tag data
        let kmlData:string|any = await getTagMatches(ele, kmlTags);
        if ((kmlData?.length ?? 0) > 0) {
          // @ts-ignore
          await Promise.all(Object.entries(fileNameMap).map(async ([originalImageName, newImageName]) => {
            kmlData = kmlData.replace(originalImageName, newImageName);
          }));
        }

        // add to the data object
        dataObj[file.name] = kmlData.length > 0 ? `<Folder id="${uuid()}">\n<name>${name}</name>\n<open>1</open>\n${kmlData}\n</Folder>\n` : '$ERROR$';
      } catch (e:any) {
        console.log(e);
        dataObj[file.name] = '$ERROR$';
      }
    }
  }

  // package it up
  console.log(dataObj);
  const kmlStr: string = await generateKmlFile(dataObj);
  const blob = new Blob([kmlStr], {type: 'text/plain'});
  zip.file('doc.kml', blob);
  postMessage(zip);
};