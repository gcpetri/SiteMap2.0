import JSZip from "jszip"
import KmzData from "../types/KmzData"

export const unzipKmz = async (file: File) => {
  const kmlData: KmzData = {
    kml: '',
    images: [],
  }
  const jsZip = new JSZip()
  const content = await jsZip.loadAsync(file)
   
  await Promise.all(Object.entries(content.files).map(async ([name, file]: [string, any]) => {
    if (name.toUpperCase().endsWith('.KML')) {
      kmlData.kml = await file.async('string');
    } else if (name.toUpperCase().endsWith('.PNG')) {
      kmlData.images.push(file);
    }
  }))

  return kmlData
}