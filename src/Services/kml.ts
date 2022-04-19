import { v4 as uuid } from 'uuid';
import { config } from "../config";

const getPlacemark = (name:string, point:string) => {
  return `<Placemark id="${uuid()}"><name>${name}</name>#msn_icon28<Point><coordinates>${point}</coordinates></Point></Placemark>`;
};

export const generateKmlFile = async (dataObj:any) => {
  let kmlFileStr: string = config.kml_header;
  // @ts-ignore
  await Promise.all(Object.entries(dataObj).map(async ([key, value]) => {
    if (key.endsWith('.pdf') && Array.isArray(value)) {
      let newPdfFolderStr: string = `<Folder id="${uuid()}"><name>${key}</name><open>0</open>`;
      await Promise.all(value.map(async (coordinateStr:string, index:number) => new Promise((resolve) => {
        resolve(newPdfFolderStr += getPlacemark(`B-${index}`, coordinateStr));
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