import { Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import FileReader from "./Components/FileReader";
import InputOptions from "./Components/InputOptions";
import TestReader from './Components/TestReader';
import { config } from './config';
import './styles/style.scss';

function App() {

  const [regexItems, setRegexItems] = useState<string[]>(config.default_regex.map((item:any) => item.reg));
  const [kmlTags, setKmlTags] = useState<string[]>(config.default_kml_tag_options);

  const addRegexItem = (newItem:string) => {
    const newRegexItems: string[] = [...regexItems, newItem];
    setRegexItems(newRegexItems);
    window.localStorage.setItem('regex-items', JSON.stringify(newRegexItems));
  };

  const removeRegexItem = (oldItem:string) => {
    const newRegexItems: string[] = regexItems.filter(item => item !== oldItem);
    setRegexItems(newRegexItems);
    window.localStorage.setItem('regex-items', JSON.stringify(newRegexItems));
  };

  const resetRegexItems = () => {
    const defaultRegexItems: string[] = config.default_regex.map((item:any) => item.reg);
    setRegexItems(defaultRegexItems);
    window.localStorage.setItem('regex-items', JSON.stringify(defaultRegexItems));
  };

  const resetKmlTags = () => {
    setKmlTags(config.default_kml_tag_options);
    window.localStorage.setItem('kml-tags', JSON.stringify(config.default_kml_tag_options));
  };

  // get regex and tags from local storage
  useEffect(() => {
    const cachedRegexItems: string|null = window.localStorage.getItem('regex-items');
    if (cachedRegexItems !== null && cachedRegexItems !== undefined) {
      setRegexItems(JSON.parse(cachedRegexItems));
    }
    const cachedKmlTags: string|null = window.localStorage.getItem('kml-tags');
    if (cachedKmlTags !== null && cachedKmlTags !== undefined) {
      setKmlTags(JSON.parse(cachedKmlTags));
    }
  }, []);

  return (
    <div className="App">
      <div className="home-container">
        <Typography variant="h2" style={{textAlign: 'center'}}>Rock KMZ</Typography>
        <InputOptions 
          regexItems={regexItems} 
          addRegexItem={addRegexItem} 
          removeRegexItem={removeRegexItem} 
          kmlTags={kmlTags}
          setKmlTags={setKmlTags}
          resetRegexItems={resetRegexItems}
          resetKmlTags={resetKmlTags}
        />
        <TestReader regexItems={regexItems} kmlTags={kmlTags} />
        <FileReader regexItems={regexItems} kmlTags={kmlTags} />
      </div>
    </div>
  );
}

export default App;
