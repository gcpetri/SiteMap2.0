import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, 
  Paper, Divider, Chip, Box } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { config } from "../config";
import { generateRegexStr, regExpFlags } from "../Services/regex";
import { getDataFromKmz, getKmlDom, getPdfText, getTagMatches } from "../Services/scrapper";
import { v4 as uuid } from 'uuid';

interface TestReaderProps {
  regexItems: string[],
  kmlTags: string[],
}

const TestReader = (props:TestReaderProps): React.ReactElement => {

  const [mounted, setMounted] = useState<boolean>(false);
  const [regExp, setRegexExp] = useState<RegExp|null>(null);
  const [fileText, setFileText] = useState<string>('');
  const [markedFileText, setMarkedFileText] = useState<string>('');
  const [numMatches, setNumMatches] = useState<number>(0);

  const [kmDoc, setKmDoc] = useState<Document|null>(null);
  const [kmFileText, setKmFileText] = useState<string>('');
  const [kmTagCounts, setKmTagCounts] = useState<any>({});

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

  useEffect(() => {
    if (regExp === null && fileText.length !== 0) {
      setMarkedFileText('ERROR: no regular expressions, nothing will be scraped');
      setNumMatches(0);
      return;
    }
    if (regExp !== null && fileText.length !== 0) {
      displayText(fileText, regExp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regExp]);

  useEffect(() => {
    if (kmDoc !== null) {
      console.log('re-parsing kml');
      displayKmText(kmDoc, props.kmlTags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.kmlTags]);


  // PDF Section
  const handleFileSelect = async (e:any) => {
    if (!mounted) return;
    try {
      if (regExp === null) {
        setMarkedFileText('ERROR: no regular expressions, nothing will be scraped');
        return;
      }

      // prompt the client choose a file
      const pickerOpts = {
        types: [
          {
            description: 'PDF',
            accept: {
              'application/pdf': ['.pdf'],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };
      const [fileHandle] = await showOpenFilePicker(pickerOpts);
      if (!fileHandle) {
        setMarkedFileText('ERROR: could not read selected file');
        return;
      }

      // get the matches baby
      const pdfText: string = await getPdfText(await fileHandle.getFile());
      setFileText(pdfText);
      displayText(pdfText, regExp);
    } catch (e:any) {
      console.log(e);
      // setMarkedFileText('ERROR: could not parse pdf');
    }
  };

  const displayText = (text:string, regexExp:RegExp) => {
    let numberOfMatches: number = 0;
    setMarkedFileText(text.replace(regexExp, (str:string) => {
      numberOfMatches += 1;
      return `<mark>${str}</mark>`
    }));
    setNumMatches(numberOfMatches);
  };

  const handleFileClear = async (e:any) => {
    setFileText('');
    setNumMatches(0);
    setMarkedFileText('');
  };

  // KML/KMZ Section
  const handleKmFileSelect = async (e:any) => {
    if (!mounted) return;
    try {
      if (props.kmlTags.length === 0) {
        setKmFileText('ERROR: no KML tags, nothing will be scraped');
        return;
      }

      // prompt the client choose a file
      const pickerOpts = {
        types: [
          {
            description: 'MAP',
            accept: {
              'application/vnd.google-earth.kmz': ['.kmz'],
              'application/vnd.google-earth.kml+xml': ['.kml'],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };
      const [fileHandle] = await showOpenFilePicker(pickerOpts);
      if (!fileHandle) {
        setKmFileText('ERROR: could not read selected file');
        return;
      }

      // parse if kml or kmz
      const file: File = await fileHandle.getFile();
      let kmlDoc:Document|any = null;
      if (file.name.endsWith('.kmz')) {
        kmlDoc = await getDataFromKmz(await fileHandle.getFile());
      } else {
        kmlDoc = await getKmlDom(await file.text());
      }
      if (kmlDoc === null) throw new Error('Could not get kmlDoc');
      setKmDoc(kmlDoc);
      displayKmText(kmlDoc, props.kmlTags);
    } catch (e:any) {
      console.log(e);
      setKmFileText('ERROR: could not parse kmz/kml');
    }
  };

  const displayKmText = async (kmDoc:Document, kmlTags:string[]) => {
    const ele: HTMLElement|any = kmDoc.getElementsByTagName('Document')[0];
    if (ele === null || ele === undefined) throw new Error('Document undefined');

    // get the tags
    const kmlText:string|any = await getTagMatches(ele, kmlTags);
    let styleStr:string = '';
    Object.values(config.kml_default_styles).forEach((style:string) => styleStr += style);
    const finalKmlDomText:string = `${config.kml_header}
      ${styleStr}
      <Folder id="${uuid()}"><name>test-file</name><open>0</open>${kmlText}</Folder>
      ${config.kml_footer}
    `;
    const finalKmlDom: Document = await getKmlDom(finalKmlDomText);

    // add any additional styles required
    const styleXmlItems:any = ele.getElementsByTagName('Style');
    const finalKmlDomDoc = finalKmlDom.getElementsByTagName('Document')[0];
    const newStyleItems:string[] = [];
    if ((styleXmlItems?.length ?? 0) !== 0) {
      Array.from(styleXmlItems).forEach((item:any) => {
        if ((item?.id?.length ?? 0) !== 0 
          && config.kml_default_style_ids.indexOf(item.id) === -1 && newStyleItems.indexOf(item.id) === -1) {
          console.log(item.id);
          finalKmlDomDoc.append(item);
          newStyleItems.push(item.id);
        }
      });
    }

    // count each tag scraped
    const kmlTagCountData:any = {};
    kmlTags.forEach((tag:string) => {
      kmlTagCountData[tag] = finalKmlDomDoc.getElementsByTagName(tag)?.length ?? 0;
    });

    setKmFileText(`${new XMLSerializer().serializeToString(finalKmlDom)}`);
    setKmTagCounts(kmlTagCountData);
  };

  const handleKmFileClear = async (e:any) => {
    setKmDoc(null);
    setKmFileText('');
    setKmTagCounts({});
  };


  return (
    <div className="row-container">
      <div className="container">
        <div className="row-container">
          <Accordion style={{maxWidth: '90vw', width: '90vw'}}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              style={{justifyContent: 'center'}}
            >
              <Typography><b>Test</b></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="container">
                <div className="row-container">
                  <div className="container" style={{width: '100%'}}>
                    <div className="row-container">
                      <Typography variant="overline">View scraper matches of a <b>PDF</b> file.</Typography>
                    </div>
                    <div className="row-container">
                      <Button variant="contained" onClick={handleFileSelect}
                        style={{width: '200px'}}>
                        Select File
                      </Button>
                    </div>
                    {markedFileText.length !== 0 && 
                    <div className="container">
                      <div className="row-container">
                        <Button variant="outlined" onClick={handleFileClear}
                          style={{width: '200px'}}>
                          Clear
                        </Button>
                      </div>
                      <div className="row-container">
                        <Typography variant="caption"><b>{numMatches}</b> Matches</Typography>
                      </div>
                      <Paper elevation={3} style={{padding: '10px', maxHeight: '80vh', overflow: 'hidden scroll'}}>
                        <div dangerouslySetInnerHTML={{ __html: markedFileText }} style={{wordWrap: 'break-word'}}></div>
                      </Paper>
                    </div>}
                  </div>
                </div>
                <Divider />
                <div className="row-container">
                  <div className="container" style={{width: '100%'}}>
                    <div className="row-container">
                      <Typography variant="overline">View scraper matches of a <b>KMZ</b> or <b>KML</b> file.</Typography>
                    </div>
                    <div className="row-container">
                      <Button variant="contained" onClick={handleKmFileSelect}
                        style={{width: '200px'}}>
                        Select File
                      </Button>
                    </div>
                    {kmFileText.length !== 0 && 
                    <div className="container">
                      <div className="row-container">
                        <Button variant="outlined" onClick={handleKmFileClear}
                          style={{width: '200px'}}>
                          Clear
                        </Button>
                      </div>
                      <div className="row-container">
                        <Typography variant="caption">Tags Found</Typography>
                      </div>
                      <div className="row-container">
                        {Object.entries(kmTagCounts).map(([tagName, tagCount], index:number) => {
                          return (<Box key={`tag-count-${index}`} component="span" sx={{ p: 1, border: '1px solid #f2f2f2', mr: 2, borderRadius: '20px' }}>
                            {typeof tagCount === 'number' ? <Chip label={tagCount} style={{marginRight: '4px'}} /> : <Chip label={0} style={{marginRight: '2px'}} />}
                            <span>{tagName}</span>
                          </Box>)
                        })}
                      </div>
                      <Paper elevation={3} style={{padding: '10px', maxHeight: '80vh', width: '100%'}}>
                        <textarea value={kmFileText} style={{wordWrap: 'break-word', width: '100%', maxWidth: '100%', height: '40vh',
                          overflow: 'hidden scroll', maxHeight: '100%', border: 'none'}} readOnly spellCheck={false}></textarea>
                      </Paper>
                    </div>}
                  </div>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default TestReader;