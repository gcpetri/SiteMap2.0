import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import './App.css';
import FileReader from "./components/FileReader";
import Header from './components/Header';
import Preview from './components/preview/Preview';
import Scroll from './components/Scroll';
import Settings from "./components/settings/Settings";
import { NotifState, selectNotifState } from './store/notifSlice';

function App() {

  const cachedNotifState: NotifState = useSelector(selectNotifState)

  useEffect(() => {
    if (cachedNotifState.title.length > 0) {
      if (cachedNotifState.type === 'error')
        toast.error(cachedNotifState.title)
      if (cachedNotifState.type === 'info')
        toast.success(cachedNotifState.title)
      if (cachedNotifState.type === 'loading')
        toast.loading(cachedNotifState.title)
    }
  }, [cachedNotifState])

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

      <Toaster />
    </>
  )
}

export default App;
