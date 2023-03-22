import { Button, Grid, Page, Text } from "@geist-ui/core"
import { Download, Upload } from '@geist-ui/icons'
import { useEffect, useRef, useState } from "react"
import { FilePicker } from 'react-file-picker'
import { useDispatch, useSelector } from "react-redux"
import { loadFile } from "../../services/fileIO"
import { selectFileState, setFileState } from "../../store/fileSlice"
import { selectKmlState, setKmlState } from "../../store/kmlSlice"
import { setNotifState } from "../../store/notifSlice"
import { Regex, selectRegexState, setRegexState } from "../../store/regexSlice"
import { selectSettingsValidState, setSettingsValidState } from "../../store/settingsValidSlice"
import SettingsFile from "../../types/SettingsFile"
import FileTypes from "./FileTypes"
import KmlTags from "./KmlTags"
import RegexComponent from "./RegexComponent"

interface SettingsProps {
}

const Settings: React.FC<SettingsProps> = (): React.ReactElement => {
  const dispatch = useDispatch()
  
  const cachedFileTypes: { [f: string]: boolean } = useSelector(selectFileState)
  const cachedRegexState: Regex[] = useSelector(selectRegexState)
  const cachedKmlTags: string[] = useSelector(selectKmlState)
  const cachedSettingsValid: boolean = useSelector(selectSettingsValidState)

  useEffect(() => {
    const validFileTypes = Object.values(cachedFileTypes).includes(true)
    let validPdf = true
    if (cachedFileTypes.PDF) {
      validPdf = cachedRegexState.filter(r => r.expression.length > 0).length > 0
    }
    let validKml = true
    if (cachedFileTypes.KML || cachedFileTypes.KMZ) {
      validKml = cachedKmlTags.length > 0
    }
    dispatch(setSettingsValidState(validFileTypes && validKml && validPdf))
  }, [cachedFileTypes, cachedRegexState, cachedKmlTags])

  const exportSettings = () => {
    const settings: SettingsFile = {
      instructions: 'Upload this file to SiteMap to autofill the settings',
      fileTypes: cachedFileTypes,
      regex: cachedFileTypes.PDF ? cachedRegexState.filter(r => r.expression.length > 0) : [],
      kmlTags: cachedFileTypes.KMZ || cachedFileTypes.KML ? cachedKmlTags : [],
    }

    const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sitemap-settings-${Date.now()}.json`
    a.textContent = 'Download SiteMap Settings'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a)
  }

  const importSettings = async (file: File) => {
    const fileStr = await loadFile(file)
    if (typeof fileStr === 'string') {
      const json = JSON.parse(fileStr)
      dispatch(setFileState(json.fileTypes))
      dispatch(setRegexState(json.regex))
      dispatch(setKmlState(json.kmlTags))
    }
  }

  return (
    <Page className='app-page' id='settings-page'>
      <Page.Content>
        <Grid.Container
          gap={1}
          direction='column'
          style={{height: '100%'}}
        >
          <Grid paddingBottom={0} paddingTop={0}>
            <Text
              h2
            >Setup</Text>
          </Grid>

          <FileTypes />

          {(cachedFileTypes.KMZ || cachedFileTypes.KML) &&
            <KmlTags />
          }

          {cachedFileTypes.PDF && 
            <RegexComponent />
          }

          <Grid>
            <Grid.Container gap={2}>
              <Grid>
                <FilePicker
                  extensions={['json']}
                  onChange={importSettings}
                  onError={(error: string) => {
                    dispatch(setNotifState({ type: 'error', title: error }))
                  }}
                >
                  <Button
                    id='import-setup-file-btn'
                    auto
                    ghost
                    type='secondary-light'
                    icon={<Upload />}
                    w={0.75}
                    h={0.8}
                  >
                    <span className='hide-on-small'>Import Setup File</span>
                  </Button>
                </FilePicker>
              </Grid>
              <Grid>
                <Button
                  id='export-setup-file-btn'
                  auto
                  type='secondary-light'
                  icon={<Download />}
                  w={0.75}
                  h={0.8}
                  onClick={exportSettings}
                  disabled={!cachedSettingsValid}
                >
                  <span className='hide-on-small'>Export Setup File</span>
                </Button>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Page.Content>
    </Page>
  )
}

export default Settings;