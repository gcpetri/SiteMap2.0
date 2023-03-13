import { Button, ButtonDropdown, Code, Collapse, Drawer, Grid, Page, Pagination, Spacer, Text } from "@geist-ui/core"
import { ChevronLeftCircle, ChevronRightCircle, Upload } from '@geist-ui/icons'
import { useEffect, useRef, useState } from "react"
import { FilePicker } from 'react-file-picker'
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from 'uuid'
import { loadFile } from "../../services/fileIO"
import { unzipKmz } from "../../services/kmz"
import { getPdfTextByPage } from "../../services/pdf"
import { selectFileState } from "../../store/fileSlice"
import { selectKmlState } from "../../store/kmlSlice"
import { Regex, selectRegexState } from "../../store/regexSlice"
import { selectScrollState } from "../../store/scrollSlice"
import KmzData from "../../types/KmzData"
import PageMatches, { PageMatch } from "../../types/PageMatches"
import PreviewMatches from "../../types/PreviewMatches"
import Mark from "./Mark"
import Matches from "./Matches"
import PreviewPage from "./PreviewPage"

interface PreviewProps {
}

const Preview: React.FC<PreviewProps> = (): React.ReactElement => {
  const MATCH_MARK_PREFIX = 'mk'

  const [pages, setPages] = useState<string[]>([])
  const [pageNumber, setPageNumber] = useState<number>(1)

  // focused item
  const [focusMatchId, setFocusMatchId] = useState<string|null>(null)

  const [previewMatches, setPreviewMatches] = useState<PreviewMatches>({})

  const [markedPages, setMarkedPages] = useState<JSX.Element[]>([])

  const cachedScroll: string = useSelector(selectScrollState)

  const cachedFileTypes: { [f: string]: boolean } = useSelector(selectFileState)
  const cachedRegexState: Regex[] = useSelector(selectRegexState)
  const cachedKmlTags: string[] = useSelector(selectKmlState)

  const previewParentRef = useRef<HTMLDivElement>(null)

  const [focusPatternId, setFocusPatternId] = useState<string|null>(null)

  const [showMatches, setShowMatches] = useState<boolean>(false)

  const [importText, setImportText] = useState<string>('')
  const [importError, setImportError] = useState<string>('')

  const generateMatchId = () => {
    return MATCH_MARK_PREFIX + '-' +  uuidv4()
  }

  // Start focus on mark section
  const handleMatchClick = (pageNo: number, patternId: string, matchId: string) => {
    setPageNumber(pageNo)
    setFocusMatchId(matchId)
    setFocusPatternId(patternId)
    if (pageNumber === pageNo) {
      focusOnMark(matchId)
    }
  }

  const focusOnMark = (matchId: string|null) => {
    if (!matchId)
      return
    const mark = previewParentRef?.current?.querySelector(`#${matchId}`) as HTMLElement
    if (mark) {
      mark.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'})
      mark.style.backgroundColor = '#F3937F'
    }
  }
  // End focus on mark section

  // Start focus on match section
  const handleMarkClick = (patternId: string, matchId: string) => {
    console.log(matchId)
    focusOnMark(matchId)
    setFocusMatchId(matchId)
    setFocusPatternId(patternId)
    setShowMatches(true)
  }
   
  useEffect(() => {
    focusOnMark(focusMatchId)
  }, [focusMatchId])
  // End focus on match section

  const importFile = async (file: File) => {
    if (file.name.endsWith('.pdf') && Object.keys(cachedRegexState).length > 0) {
      const newPages = await getPdfTextByPage(file)
      setPages(newPages)

      // initialize match data
      const initialPreviewMatches: PreviewMatches = {}
      Object.values(cachedRegexState).forEach((r: Regex) => {
        initialPreviewMatches[r.id] = {
          label: r.label,
          expression: r.expression,
          matches: [],
        }
      })

      // initialize page match data
      const initialPageMatches: PageMatches = {}
      newPages.forEach((_: string, index: number) => {
        initialPageMatches[index] = []
      })

      // generate regex string
      let regexStr = ''
      cachedRegexState.map((r: Regex) => {
        regexStr += `(?<${r.id}>${r.expression})|`
      })
      regexStr = regexStr.slice(0,-1)
      const regExp = new RegExp(regexStr, 'msgi')

      // find matches in each page
      newPages.map((page: string, index: number) => {
        const found = Array.from(page.matchAll(regExp))
        found.map((match) => {
          if (match.groups && match.index) {
            const matchId: string = generateMatchId()
            const pageMatch: PageMatch = {
              regex: [],
              matchId: matchId,
              match: '',
              startIndex: match.index,
              endIndex: match.index,
            }

            Object.entries(match.groups).map(([regexId, str]: [string, string]) => {
              if (str) {
                initialPreviewMatches[regexId].matches.push({
                  match: str,
                  matchId: matchId,
                  pageNo: index + 1
                })
                pageMatch.regex.push({
                  id: regexId,
                  label: initialPreviewMatches[regexId].label,
                })
                pageMatch.match = str
                pageMatch.endIndex = pageMatch.endIndex + str.length
              }
            })

            initialPageMatches[index].push(pageMatch)
          }
        })
      })

      const markedPages: JSX.Element[] = []
      Object.entries(initialPageMatches).map(([pageNo, data]: [string, PageMatch[]]) => {
        const pgNumber = parseInt(pageNo)
        // no matches on this page
        if (data.length === 0) {
          return markedPages.push(<>{newPages[pgNumber]}</>)
        }
      
        // order the matches on the page
        const sortedData = data
        sortedData.sort((a:any, b:any) => a.startIndex > b.startIndex ? 1 : 0)

        const markedPage: JSX.Element[] = []
        let lastIndex: number = 0
        sortedData.map((d: any, index: number) => {
          markedPage.push(<span key={`${d.matchId}-pretext`}>{newPages[pgNumber].substring(lastIndex, d.startIndex)}</span>)

          markedPage.push(
            <Mark
              regex={d.regex}
              matchId={d.matchId}
              text={newPages[pgNumber].substring(d.startIndex, d.endIndex)}
              onClick={handleMarkClick}
            />
          )

          if (sortedData.length - 1 === index) {
            markedPage.push(<span key={`${index}-posttext`}>{newPages[pgNumber].substring(d.endIndex)}</span>)
          }

          lastIndex = d.endIndex
        })

        markedPages.push(<>{markedPage}</>)
      })
      console.log(initialPageMatches)

      setMarkedPages(markedPages)
      setPreviewMatches(initialPreviewMatches)
    } else if (file.name.endsWith('.kml')) {
      const fileStr = await loadFile(file)
      setPages([fileStr as string])
    } else if (file.name.endsWith('.kmz')) {
      const kmzData: KmzData = await unzipKmz(file)
      setPages([kmzData.kml])
    }
  }

  return (
    <Page className='app-page' id='preview-page'>
      <Button
        id='preview-show-matches-btn'
        type='success'
        onClick={() => setShowMatches(true)}
      >
        MATCHES
      </Button>
      <Drawer visible={showMatches} 
        onClose={() => setShowMatches(false)}
        placement="right"
      >
        <Drawer.Title style={{
          color: '#0070f3'
        }}>Matches</Drawer.Title>
        <Drawer.Subtitle>{}</Drawer.Subtitle>
        <Drawer.Content>
          <Matches
            focusPatternId={focusPatternId}
            focusMatchId={focusMatchId}
            previewMatches={previewMatches}
            onClick={handleMatchClick}
          />
        </Drawer.Content>
      </Drawer>
      <Page.Content>
        <Grid.Container
          gap={3}
          direction='column'
          style={{height: '80%'}}
        >
          <Grid paddingBottom={0} paddingTop={0}>
            <Text h2 margin={0}>Preview</Text>
          </Grid>

          <Grid
            style={{
              maxWidth: '600px'
            }}
          >
            <Grid.Container
              gap={1}
              direction='column'
              height='90%'
            >
              <Grid>
                <div
                  id='preview-container'
                  ref={previewParentRef}
                >
                  {markedPages.length > 0 && <PreviewPage
                    content={markedPages[pageNumber - 1]}
                    focusMatchId={focusMatchId}
                    pageNo={pageNumber}
                    onMount={focusOnMark}
                  />}
                </div>
              </Grid>
              <Grid>
                <Grid.Container
                  justify='space-between'
                >
                  <Grid>
                    <Pagination
                      count={pages.length}
                      limit={5}
                      onChange={setPageNumber}
                      page={pageNumber}
                    >
                      <Pagination.Next><ChevronRightCircle /></Pagination.Next>
                      <Pagination.Previous><ChevronLeftCircle /></Pagination.Previous>
                    </Pagination>
                  </Grid>
                  <Grid>
                    <FilePicker
                      extensions={Object.keys(cachedFileTypes).map(suffix => suffix.toLocaleLowerCase())}
                      onChange={importFile}
                      onError={setImportError}
                    >
                      <Button
                        auto
                        ghost
                        type='secondary-light'
                        icon={<Upload />}
                      >
                        <span className='hide-on-small'>Import Preview File</span>
                      </Button>
                    </FilePicker>
                  </Grid>
                </Grid.Container>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Page.Content>
    </Page>
  )
}

export default Preview;