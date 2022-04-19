import { Button, IconButton, Snackbar, CircularProgress, Typography, Tooltip } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import { getDataFromKmz, getPdfText, getRegexMatches, getTagMatches } from "../Services/scrapper";
import { generateRegexStr, regExpFlags } from "../Services/regex";
import { config } from "../config";
import { v4 as uuid } from 'uuid';
import { downloadKmlFile, downloadJsonFile } from "../Services/download";
import { generateKmlFile } from "../Services/kml";

interface FileReaderProps{
  regexItems: string[],
  kmlTags: string[],
};

const FileReader: React.FC<FileReaderProps> = (props): React.ReactElement => {

  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle|null>(null);
  const [regExp, setRegexExp] = useState<RegExp|null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const regexStr: string|null = generateRegexStr(props.regexItems);
    regexStr === null ? setRegexExp(null) : setRegexExp(new RegExp(regexStr, regExpFlags));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const regexStr: string|null = generateRegexStr(props.regexItems);
    regexStr === null ? setRegexExp(null) : setRegexExp(new RegExp(regexStr, regExpFlags));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.regexItems]);

  const readFileData = async (dirHandle:FileSystemDirectoryHandle, regexExp:RegExp|null, kmlTags:string[]) => {
    // generate a recursive file iterator
    async function* getFilesRecursively(entry:FileSystemDirectoryHandle): AsyncIterable<File> {
      // tslint:disable-next-line await-promise
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const [name, handle] of entry) {
        if (handle.kind === 'file') { // it is a file
          yield handle.getFile();
        }
        else { // it is a directory
          yield* getFilesRecursively(handle);
        }
      }
    };

    // loop through all files and add to data object
    const iterator: AsyncIterable<File> = getFilesRecursively(dirHandle);
    const dataObj: any = {};
    dataObj['additional-styles'] = [];
    for await (let value of iterator) {
      const file: File = value;
      if ((file.type === 'application/pdf' || file.name.endsWith('.pdf')) 
        && regexExp !== null) { // Scrape PDF
        setCurrentFileName(file.name);
        try {
          const pdfText: string = await getPdfText(file);
          const regexMatches: string[] = await getRegexMatches(regexExp, pdfText);
          dataObj[file.name] = regexMatches;
        } catch (e:any) {
          console.log(e);
          dataObj[file.name] = '$ERROR$';
        }
      } else if ((file.type === 'application/vnd.google-earth.kmz' || file.name.endsWith('.kmz')) 
        && kmlTags.length > 0) { // Scrape KMZ
        setCurrentFileName(file.name);
        try {
          // main point: get Points, GroundOverlays, etc.
          const kmlDoc:Document|any = await getDataFromKmz(file);
          const ele: HTMLElement|null = kmlDoc.getElementsByTagName('Document')[0];
          if (ele === null || ele === undefined) throw new Error('Document undefined');
          const kmlData:string|any = await getTagMatches(ele, kmlTags);
          dataObj[file.name] = kmlData.length > 0 ? `<Folder id="${uuid()}">\n<name>${file.name}</name>\n<open>1</open>\n${kmlData}\n</Folder>\n` : '$ERROR$';
          
          // add any additional styles required
          const styleXmlItems:any = ele.getElementsByTagName('Style');
          if ((styleXmlItems?.length ?? 0) !== 0) {
            Array.from(styleXmlItems).forEach((item:any) => {
              if ((item?.id?.length ?? 0) !== 0
                && config.kml_default_style_ids.indexOf(item.id) === -1 && dataObj['additional-styles'].indexOf(item.id) === -1) {
                console.log(item.id);
                dataObj['additional-styles'].push(`${item.outerHTML}`);
              }
            });
          }
        } catch (e:any) {
          console.log(e);
          dataObj[file.name] = '$ERROR$';
        }
      }
    }

    // download the data for the user's reference
    // await downloadJsonFile(dataObj);

    // download the kml
    const kmlStr: string = await generateKmlFile(dataObj);
    await downloadKmlFile(kmlStr);
  };

  const handleDirectorySelect = async (e:any) => {
    if (!mounted) return;
    try {
      // request the client choose a directory
      const newDirHandle: FileSystemDirectoryHandle = await showDirectoryPicker({
        startIn: "desktop"
      });
      if (!newDirHandle) {
        alert('could not handle selected directory');
        return;
      }
      setDirHandle(newDirHandle);
    } catch (e:any) {
      console.log(e);
    }
  };

  const handleGo = async () => {
    if (dirHandle === null) {
      alert('Could not read files from directory');
      return;
    };
    if (regExp === null && (props.kmlTags?.length ?? 0) === 0) {
      alert('ERROR: No regular expression(s) or kml tag(s) are present');
      return;
    }
    setLoading(true);
    // read the file data
    try {
      await readFileData(dirHandle, regExp, props.kmlTags);
    } catch (e:any) {
      console.log(e);
      alert('Error Encountered');
    }

    // reset
    setCurrentFileName('');
    setShowToast(true);
    setLoading(false);
  };

  const handleClose = () => {
    setShowToast(false);
  };

  return (
    <div className="row-container">
      <div className="container">
        <div className="row-container">
          <Typography variant="h5">Scrape Files</Typography>
        </div>
        <div className="row-container">
          <Typography variant="overline" style={{textAlign: 'center'}}>
            Generates a <b>kml</b> file by recursively searching the files in the directory chosen below.
            <br></br>
            It will scrape regular expression matches from <b>pdf</b> files and scrape tags from <b>kmz</b> files.
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
              <Typography variant="caption">{currentFileName}</Typography>
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
      </div>
    </div>
  );
};

export default FileReader;