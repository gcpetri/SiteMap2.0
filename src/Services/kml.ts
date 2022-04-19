import { v4 as uuid } from 'uuid';
import { config } from "../config";

const switchGps = (match:string) => {
  const coorPair = match.split(',');
  return Math.abs(parseFloat(coorPair[1])) > Math.abs(parseFloat(coorPair[0])) 
    ? `${coorPair[1]},${coorPair[0]}` : `${coorPair[0]},${coorPair[1]}`;
};

const getPlacemark = (name:string, point:string) => {
  return `<Placemark id="${uuid()}"><name>${name}</name><styleUrl>#msn_icon2800</styleUrl><Point><coordinates>${point},0</coordinates></Point></Placemark>\n`;
};

export const generateKmlFile = async (dataObj:any) => {
  let kmlFileStr: string = config.kml_header;
  await Promise.all(Object.values(config.kml_default_styles).map(async (styleStr:string) => new Promise((resolve) => {
    resolve(kmlFileStr += styleStr + '\n');
  })));
  const additionalStyles: string[] = dataObj['additional-styles'];
  if ((additionalStyles?.length ?? 0) !== 0) {
    await Promise.all(additionalStyles.map(async (styleStr:string) => 
      new Promise((resolve) => resolve(kmlFileStr += styleStr + '\n'))));
    kmlFileStr += '\n';
  }
  // @ts-ignore
  await Promise.all(Object.entries(dataObj).map(async ([key, value]) => {
    if (key.endsWith('.pdf') && Array.isArray(value)) {
      let newPdfFolderStr: string = `<Folder id="${uuid()}"><name>${key}</name><open>1</open>\n`;
      await Promise.all(value.map(async (coordinateStr:string, index:number) => new Promise((resolve) => {
        resolve(newPdfFolderStr += getPlacemark(`B-${index}`, switchGps(coordinateStr)));
      })));
      newPdfFolderStr += '</Folder>\n';
      kmlFileStr += newPdfFolderStr;
    } else if (key.endsWith('.kmz')) {
      kmlFileStr += value + '\n';
    }
  }));
  kmlFileStr += config.kml_footer;
  return kmlFileStr;
};