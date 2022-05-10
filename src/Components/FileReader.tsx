import { Button, IconButton, Snackbar, CircularProgress, Typography, Tooltip } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import { generateRegexStr, regExpFlags } from "../Services/regex";
import { downloadKmzFile } from "../Services/download";

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
  const [worker, setWorker] = useState<any>(null);

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
    console.log('go worker...');
    // send it off to the worker
    if (!window.Worker) {
      console.log('workers are not supported');
      return handleCancel();
    }
    // @ts-ignore
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    setWorker(worker);
    worker.onmessage = async (e:any) => {
      if (typeof e.data === "string") {
        setCurrentFileName(e.data);
      } else {
        // download the kml
        await downloadKmzFile(e.data);
        // reset
        await handleCancel();
      }
    };
    worker.postMessage([dirHandle, regexExp, kmlTags]);
    worker.onerror = async (e) => {
      console.log(e);
      // reset
      await handleCancel();
    }
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

  const handleCancel = async () => {
    if (worker !== null && worker !== undefined) {
      worker.terminate();
    }
    // reset
    setCurrentFileName('');
    setShowToast(true);
    setLoading(false);
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
      // reset
      await handleCancel();
    }
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
            {loading && <div className="row-container">
              <Button variant="outlined" onClick={handleCancel}
                disabled={!loading} style={{width: '150px'}} color="error">
                Cancel
              </Button>
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