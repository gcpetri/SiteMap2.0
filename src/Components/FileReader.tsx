// import { Button, IconButton, Snackbar, CircularProgress, Typography, Tooltip } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
// import { Close } from "@mui/icons-material";
import { getDataFromKmz, getPdfText, getTagMatches } from "../services/scrapper";
import { generateRegexStr, regExpFlags } from "../services/regex";
import { v4 as uuid } from 'uuid';
import { downloadKmzFile } from "../services/download";
import { generateKmlFile } from "../services/kml";
// const JSZip = require("jszip");

interface FileReaderProps{
};

const FileReader: React.FC<FileReaderProps> = (props): React.ReactElement => {

  // const [mounted, setMounted] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [showToast, setShowToast] = useState<boolean>(false);
  // const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle|null>(null);
  // const [regExp, setRegexExp] = useState<RegExp|null>(null);
  // const [currentFileName, setCurrentFileName] = useState<string>('');

  // useEffect(() => {
  //   setMounted(true);
  //   const regexStr: string|null = generateRegexStr(props.regexItems);
  //   regexStr === null ? setRegexExp(null) : setRegexExp(new RegExp(regexStr, regExpFlags));
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   const regexStr: string|null = generateRegexStr(props.regexItems);
  //   regexStr === null ? setRegexExp(null) : setRegexExp(new RegExp(regexStr, regExpFlags));
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.regexItems]);

  // const readFileData = async (dirHandle:FileSystemDirectoryHandle, regexExp:RegExp|null, kmlTags:string[]) => {
  //   // generate a recursive file iterator
  //   async function* getFilesRecursively(path:string, entry:FileSystemDirectoryHandle): AsyncIterable<[string,File]> {
  //     // tslint:disable-next-line await-promise
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     for await (const [name, handle] of entry) {
  //       if (handle.kind === 'file') { // it is a file
  //         const newPath: string = path.length === 0 ? name : `${path}/${name}`;
  //         const file: File = await handle.getFile();
  //         yield [newPath, file];
  //       }
  //       else { // it is a directory
  //         const newPath: string = path.length === 0 ? handle.name : `${path}/${handle.name}`;
  //         yield* getFilesRecursively(newPath, handle);
  //       }
  //     }
  //   };

  //   // loop through all files and add to data object
  //   const iterator: AsyncIterable<[string,File]> = getFilesRecursively('', dirHandle);
  //   const dataObj: any = {};
  //   const styleIds: string[] = [];
  //   const styleMapIds: string[] = [];
  //   dataObj['styles'] = [];
  //   dataObj['style-maps'] = [];

  //   // const zip = new JSZip();
  //   for await (let value of iterator) {
  //     const name: string = value[0];
  //     const file: File = value[1];
  //     if ((file.type === 'application/pdf' || file.name.endsWith('.pdf')) 
  //       && regexExp !== null) { // Scrape PDF
  //       setCurrentFileName(name);
  //       try {
  //         const pdfText: string = await getPdfText(file);
  //         const regexMatches: string[] = await getRegexMatches(regexExp, pdfText);
  //         dataObj[name] = regexMatches;
  //       } catch (e:any) {
  //         console.log(e);
  //         dataObj[name] = '$ERROR$';
  //       }
  //     } else if ((file.type === 'application/vnd.google-earth.kmz' || file.name.endsWith('.kmz')) 
  //       && kmlTags.length > 0) { // Scrape KMZ
  //       setCurrentFileName(name);
  //       try {
  //         // main point: get Points, GroundOverlays, etc.
  //         const kmlObj:any = await getDataFromKmz(file);
  //         if (kmlObj === null) throw new Error('kmz object');

  //         const kmlDoc: Document|any = kmlObj['kml']; // kml document
  //         const kmlFiles: any[] = kmlObj['files']; // image files

  //         const ele: HTMLElement|null = kmlDoc.getElementsByTagName('Document')[0];
  //         if (ele === null || ele === undefined) throw new Error('Document undefined');

  //         // add files to the zip
  //         const fileNameMap:any = {};
  //         if ((kmlFiles?.length ?? 0) !== 0) {
  //           await Promise.all(kmlFiles.map(async (image:any) => {
  //             return new Promise(async (resolve) => {
  //               const newImageName: string = `files/img-${uuid()}.png`;
  //               fileNameMap[image.name] = newImageName;
  //               // resolve(zip.file(newImageName, image.async("uint8array")));
  //             });
  //           }));
  //         }

  //         // add any additional styles required
  //         const styleXmlItems:any = ele.getElementsByTagName('Style');
  //         if ((styleXmlItems?.length ?? 0) !== 0) {
  //           const newStyleItems: string[] = [];
  //           await Promise.all(Array.from(styleXmlItems).map(async (item:any) => {
  //             return new Promise(async (resolve) => {
  //               if ((item?.id?.length ?? 0) !== 0 && styleIds.indexOf(item.id) === -1) {
  //                 let styleStr: string = `${item.outerHTML}`;
  //                 // @ts-ignore
  //                 await Promise.all(Object.entries(fileNameMap).map(async ([originalImageName, newImageName]) => {
  //                   return new Promise((resolve2) => {
  //                     // @ts-ignore
  //                     resolve2(styleStr = styleStr.replace(originalImageName, newImageName));
  //                   });
  //                 }));
  //                 styleIds.push(item.id);
  //                 resolve(newStyleItems.push(styleStr));
  //               } else {
  //                 resolve('');
  //               }
  //             });
  //           }));
  //           dataObj['styles'] = [...dataObj['styles'], newStyleItems];
  //         }

  //         // add any additional style maps required
  //         const styleMapXmlItems:any = ele.getElementsByTagName('StyleMap');
  //         if ((styleMapXmlItems?.length ?? 0) !== 0) {
  //           await Promise.all(Array.from(styleMapXmlItems).map(async (item:any) => {
  //             return new Promise((resolve) => {
  //               if ((item?.id?.length ?? 0) !== 0 && styleMapIds.indexOf(item.id) === -1) {
  //                 styleMapIds.push(item.id);
  //                 resolve(dataObj['style-maps'].push(`${item.outerHTML}`));
  //               } else {
  //                 resolve('');
  //               }
  //             });
  //           }));
  //         }

  //         // get kml tag data
  //         let kmlData:string|any = await getTagMatches(ele, kmlTags);
  //         if ((kmlData?.length ?? 0) > 0) {
  //           // @ts-ignore
  //           await Promise.all(Object.entries(fileNameMap).map(async ([originalImageName, newImageName]) => {
  //             kmlData = kmlData.replace(originalImageName, newImageName);
  //           }));
  //         }

  //         // add to the data object
  //         dataObj[file.name] = kmlData.length > 0 ? `<Folder id="${uuid()}">\n<name>${name}</name>\n<open>1</open>\n${kmlData}\n</Folder>\n` : '$ERROR$';
  //       } catch (e:any) {
  //         console.log(e);
  //         dataObj[file.name] = '$ERROR$';
  //       }
  //     }
  //   }

  //   // download the kml
  //   console.log(dataObj);
  //   const kmlStr: string = await generateKmlFile(dataObj);
  //   const blob = new Blob([kmlStr], {type: 'text/plain'});
  //   // zip.file('doc.kml', blob);
  //   // console.log(zip);
  //   // await downloadKmzFile(zip);
  // };

  // const handleDirectorySelect = async (e:any) => {
  //   if (!mounted) return;
  //   try {
  //     // request the client choose a directory
  //     const newDirHandle: FileSystemDirectoryHandle = await showDirectoryPicker({
  //       startIn: "desktop"
  //     });
  //     if (!newDirHandle) {
  //       alert('could not handle selected directory');
  //       return;
  //     }
  //     setDirHandle(newDirHandle);
  //   } catch (e:any) {
  //     console.log(e);
  //   }
  // };

  // const handleGo = async () => {
  //   if (dirHandle === null) {
  //     alert('Could not read files from directory');
  //     return;
  //   };
  //   if (regExp === null && (props.kmlTags?.length ?? 0) === 0) {
  //     alert('ERROR: No regular expression(s) or kml tag(s) are present');
  //     return;
  //   }
  //   setLoading(true);
  //   // read the file data
  //   try {
  //     await readFileData(dirHandle, regExp, props.kmlTags);
  //   } catch (e:any) {
  //     console.log(e);
  //     alert('Error Encountered');
  //   }

  //   // reset
  //   setCurrentFileName('');
  //   setShowToast(true);
  //   setLoading(false);
  // };

  // const handleClose = () => {
  //   setShowToast(false);
  // };

  return (
    <div className="row-container">
      {/* <div className="container">
        <div className="row-container">
          <Typography variant="h5">Scrape Files</Typography>
        </div>
        <div className="row-container">
          <Typography variant="overline" style={{textAlign: 'center'}}>
            Generates a <b>KMZ</b> file by recursively searching the files in the directory chosen below.
            <br></br>
            It will scrape regular expression matches from <b>PDF</b> files and scrape tags from <b>KMZ</b> files.
            <br></br>
          </Typography>
        </div>
        <div className="row-container">
          <Button variant="contained" onClick={handleDirectorySelect}
            disabled={loading} style={{width: '200px'}}>
            Select Directory
          </Button>
        </div>

        {dirHandle !== null && <div className="row-container">
          <div className="container">
            <div className="row-container">
              <Tooltip title="Scrape Files & Generate KMZ">
                <Button variant="contained" onClick={handleGo}
                  disabled={loading} style={{width: '150px'}} color="success">
                  Go
                </Button>
              </Tooltip>
            </div>
            {loading && <div className="row-container">
              <CircularProgress />
            </div>}
            {loading && <div className="row-container">
              <Typography variant="caption" style={{wordWrap: 'break-word'}}>{currentFileName}</Typography>
            </div>}
          </div>
        </div>}

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={showToast}
          onClose={handleClose}
          message="All done here"
          key={'bottom-center'}
          action={
            <>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          }
        />
      </div> */}
    </div>
  );
};

export default FileReader;