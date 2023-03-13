import { Grid, Page, Spacer } from '@geist-ui/core';
import './App.css';
import FileReader from "./components/FileReader";
import Header from './components/Header';
import Preview from './components/preview/Preview';
import Scroll from './components/Scroll';
import Settings from "./components/settings/Settings";

function App() {
  return (
    <>
      <Header />
      
      <Settings />

      <Preview />

      <FileReader />
      
      <Scroll
        section={'File Preview'}
        disabled={false}
      />
    </>
  )
}

export default App;
