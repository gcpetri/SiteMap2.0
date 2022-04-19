import { v4 as uuid } from 'uuid';
import { config } from "../config";

const switchGps = (match:string) => {
  const coorPair = match.split(',');
  return Math.abs(parseFloat(coorPair[1])) > Math.abs(parseFloat(coorPair[0])) 
    ? `${coorPair[1]},${coorPair[0]}` : `${coorPair[0]},${coorPair[1]}`;
};

const getPlacemark = (name:string, point:string) => {
  return `<Placemark id="${uuid()}"><name>${name}</name><Point><coordinates>${point},0</coordinates></Point></Placemark>\n`;
};

export const generateKmlFile = async (dataObj:any) => {
  let kmlFileStr: string = config.kml_header + `\n<name>Rock-kmz-${Date.now()}</name>\n`;
  // @ts-ignore
  await Promise.all(Object.values(dataObj['styles']).map(async (styleStr:string) => new Promise((resolve) => {
    resolve(kmlFileStr += styleStr + '\n');
  })));
  // @ts-ignore
  await Promise.all(Object.values(dataObj['style-maps']).map(async (styleStr:string) => new Promise((resolve) => {
    resolve(kmlFileStr += styleStr + '\n');
  })));
  // @ts-ignore
  await Promise.all(Object.entries(dataObj).map(async ([key, value]) => {
    return new Promise(async (resolve) => {
      if (key.endsWith('.pdf') && Array.isArray(value)) {
        let newPdfFolderStr: string = `<Folder id="${uuid()}"><name>${key}</name><open>1</open>\n`;
        await Promise.all(value.map(async (coordinateStr:string, index:number) => new Promise((resolve2) => {
          resolve2(newPdfFolderStr += getPlacemark(`B-${index+1}`, switchGps(coordinateStr)));
        })));
        newPdfFolderStr += '</Folder>\n';
        resolve(kmlFileStr += newPdfFolderStr);
      } else if (key.endsWith('.kmz')) {
        resolve(kmlFileStr += value + '\n');
      } else {
        resolve('');
      }
    });
  }));
  kmlFileStr += config.kml_footer;
  return kmlFileStr;
};