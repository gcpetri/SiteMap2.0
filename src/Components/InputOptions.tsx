import { IconButton, InputAdornment, TextField, List, ListItem,
  ListItemText, Accordion, AccordionSummary, Typography, AccordionDetails, Divider, Link, Select, 
  Chip, Box, OutlinedInput, MenuItem, SelectChangeEvent, InputLabel, FormControl, Button } from "@mui/material";
import React from "react";
import { useState } from "react";
import { CheckCircle, Delete, ExpandMore } from "@mui/icons-material";
import { regExpFlags } from "../Services/regex";
import { config } from "../config";

interface InputOptionProps{
  regexItems: string[],
  addRegexItem: any,
  removeRegexItem: any,
  kmlTags: string[],
  setKmlTags: any,
  resetRegexItems: any,
  resetKmlTags: any,
};

const InputOptions: React.FC<InputOptionProps> = (props): React.ReactElement => {

  const [newRegex, setNewRegex] = useState<string>('');

  const handleKmlTagChange = (event: SelectChangeEvent<typeof props.kmlTags>) => {
    const {
      target: { value },
    } = event;
    const kmlTags: string[] = typeof value === 'string' ? value.split(',') : value;
    props.setKmlTags(kmlTags);
    window.localStorage.setItem('kml-tags', JSON.stringify(kmlTags));
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
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
              <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                <Typography><b>Settings</b></Typography> 
                <div>
                  <Chip label={props.regexItems.length} /> <Typography variant="caption">Regex</Typography> <Chip label={props.kmlTags.length} /> <Typography variant="caption">KMLTags</Typography>
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="container">
                <Divider />
                <div className="row-container">
                  <div className="container">
                    <div className="row-container">
                      <div className="container">
                        <Typography variant="overline"><b>PDF</b> Input Text to Search for in files</Typography>
                        <Link href="https://regex101.com/" target="_blank" underline="none"
                          style={{textAlign: 'center'}}>
                          <Typography variant="caption">Regular Expression Reference</Typography>
                        </Link>
                      </div>
                    </div>
                    <div className="row-container">
                      <List>
                        {props.regexItems.map((item:string, i:number) =>
                          <ListItem
                            key={`input-options-${i}`}
                            secondaryAction={
                              <IconButton edge="end" aria-label="delete"
                                onClick={() => props.removeRegexItem(item)}>
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemText style={{wordBreak: 'break-word'}}
                              primary={item}
                            />
                          </ListItem>
                        )}
                      </List>
                    </div>
                    <div className="row-container">
                      <TextField
                        label="Add a Regular Expression to query pdf file content"
                        variant="outlined"
                        id="standard-start-adornment"
                        sx={{ m: 1 }}
                        value={newRegex}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">/</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/{regExpFlags}</InputAdornment>,
                        }}
                        onChange={(e) => setNewRegex(e.target.value)}
                      />
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <IconButton type="submit" aria-label="search" style={{height: '40px'}}
                          onClick={() => {
                            if (newRegex.length === 0) return;
                            props.addRegexItem(newRegex);
                            setNewRegex('');
                          }}>
                          <CheckCircle color="primary"/>
                        </IconButton>
                      </div>
                    </div>
                    <div className="row-container">
                      <Button variant="outlined" size="small" style={{width: 'fit-content'}}
                        onClick={props.resetRegexItems}>
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </div>
                {/*<Divider />
                <div className="row-container">
                  <div className="container">
                    <div className="row-container">
                      <div className="container">
                        <Typography variant="overline"><b>PDF</b> File name Filtering</Typography>
                        <Link href="https://regex101.com/" target="_blank" underline="none"
                          style={{textAlign: 'center'}}>
                          <Typography variant="caption">Regular Expression Reference</Typography>
                        </Link>
                      </div>
                    </div>
                    <div className="row-container">
                      <List>
                        {props.regexItems.map((item:string, i:number) =>
                          <ListItem
                            key={`input-options-${i}`}
                            secondaryAction={
                              <IconButton edge="end" aria-label="delete"
                                onClick={() => props.removeRegexItem(item)}>
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemText style={{wordBreak: 'break-word'}}
                              primary={item}
                            />
                          </ListItem>
                        )}
                      </List>
                    </div>
                    <div className="row-container">
                      <TextField
                        label="Add a Regular Expression to filter pdf file names"
                        variant="outlined"
                        id="standard-start-adornment"
                        sx={{ m: 1 }}
                        value={newRegex}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">/</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/{regExpFlags}</InputAdornment>,
                        }}
                        onChange={(e) => setNewRegex(e.target.value)}
                      />
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <IconButton type="submit" aria-label="search" style={{height: '40px'}}
                          onClick={() => {
                            if (newRegex.length === 0) return;
                            props.addRegexItem(newRegex);
                            setNewRegex('');
                          }}>
                          <CheckCircle color="primary"/>
                        </IconButton>
                      </div>
                    </div>
                    <div className="row-container">
                      <Button variant="outlined" size="small" style={{width: 'fit-content'}}
                        onClick={props.resetRegexItems}>
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </div>*/}
                <Divider />
                <div className="row-container">
                  <div className="container" style={{width: '100%'}}>
                    <div className="row-container">
                      <div className="container">
                        <Typography variant="overline"><b>KMZ</b> Select KML-Tags to scrape from files</Typography>
                        <Link href="https://developers.google.com/kml/documentation/kmlreference" target="_blank" underline="none"
                          style={{textAlign: 'center'}}>
                          <Typography variant="caption">KML Reference</Typography>
                        </Link>
                      </div>
                    </div>
                    <div className="row-container">
                      <FormControl sx={{ m: 1, width: 300 }}>
                        <InputLabel id="kml-tag-multiple-chip-label">Tags</InputLabel>
                        <Select
                          labelId="kml-tag-multiple-chip-label"
                          id="kml-tag-multiple-chip"
                          multiple
                          value={props.kmlTags}
                          onChange={handleKmlTagChange}
                          input={<OutlinedInput id="kml-tag-select-multiple-chip" label="Chip" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                          MenuProps={MenuProps}
                        >
                          {config.kml_tag_options.map((name:string) => (
                            <MenuItem
                              key={name}
                              value={name}
                            >
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="row-container">
                      <Button variant="outlined" size="small" style={{width: 'fit-content'}}
                        onClick={props.resetKmlTags}>
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </div>
            
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default InputOptions;