import { Button, Drawer, Grid, Page, Pagination, Text } from "@geist-ui/core"
import { ChevronLeftCircle, ChevronRightCircle, Upload } from '@geist-ui/icons'
import { useEffect, useRef, useState } from "react"
import { FilePicker } from 'react-file-picker'
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from 'uuid'
import { loadFile } from "../../services/fileIO"
import { unzipKmz } from "../../services/kmz"
import { getPdfTextByPage } from "../../services/pdf"
import { getKmlDom } from "../../services/scrapper"
import { selectFileState } from "../../store/fileSlice"
import { selectKmlState } from "../../store/kmlSlice"
import { setNotifState } from "../../store/notifSlice"
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
  const dispatch = useDispatch()
  
  const MATCH_MARK_PREFIX = 'mk'

  const [file, setFile] = useState<File|null>(null)
  const [pages, setPages] = useState<string[]>([])
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [showMatches, setShowMatches] = useState<boolean>(false)

  // focused item
  const [focusMatchId, setFocusMatchId] = useState<string|null>(null)
  const [focusPatternId, setFocusPatternId] = useState<string|null>(null)

  const [previewMatches, setPreviewMatches] = useState<PreviewMatches>({})
  const [markedPages, setMarkedPages] = useState<JSX.Element[]>([])

  const cachedFileTypes: { [f: string]: boolean } = useSelector(selectFileState)
  const cachedRegexState: Regex[] = useSelector(selectRegexState)
  const cachedKmlTags: string[] = useSelector(selectKmlState)
  const cachedScrollState: string = useSelector(selectScrollState)

  const previewParentRef = useRef<HTMLDivElement>(null)

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
    console.log('matchId', matchId)
    console.log('patternId', patternId)
    focusOnMark(matchId)
    setFocusMatchId(matchId)
    setFocusPatternId(patternId)
    setShowMatches(true)
  }
   
  useEffect(() => {
    focusOnMark(focusMatchId)
  }, [focusMatchId])
  // End focus on match section


  // Start pdf section
  const readPdf = async (file: File) => {
    const newPages = await getPdfTextByPage(file)
    setPages(newPages)
  }

  const processPdf = async () => {
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
    pages.forEach((_: string, index: number) => {
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
    pages.map((page: string, index: number) => {
      const found = Array.from(page.matchAll(regExp))
      found.map((match) => {
        if (match.groups && match.index) {
          const matchId: string = generateMatchId()
          const pageMatch: PageMatch = {
            pattern: [],
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
              pageMatch.pattern.push({
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
        return markedPages.push(<>{pages[pgNumber]}</>)
      }
    
      // order the matches on the page
      const sortedData = data
      sortedData.sort((a:any, b:any) => a.startIndex > b.startIndex ? 1 : 0)

      const markedPage: JSX.Element[] = []
      let lastIndex: number = 0
      sortedData.map((d: any, index: number) => {
        markedPage.push(<span key={`${d.matchId}-pretext`}>{pages[pgNumber].substring(lastIndex, d.startIndex)}</span>)

        markedPage.push(
          <Mark
            key={d.matchId}
            pattern={d.pattern}
            matchId={d.matchId}
            text={pages[pgNumber].substring(d.startIndex, d.endIndex)}
            onClick={handleMarkClick}
          />
        )

        if (sortedData.length - 1 === index) {
          markedPage.push(<span key={`${index}-posttext`}>{pages[pgNumber].substring(d.endIndex)}</span>)
        }

        lastIndex = d.endIndex
      })

      markedPages.push(<>{markedPage}</>)
    })
    console.log(initialPageMatches)

    setMarkedPages(markedPages)
    setPreviewMatches(initialPreviewMatches)
  }
  // End pdf section

  // Start kml section
  const readKml = async (file: File) => {
    const fileStr = await loadFile(file)
    setPages([fileStr as string])
  }

  const processKml = async () => {
    const kmlDom: Document = await getKmlDom(pages[0])
    const kmlDomStr: string = kmlDom.documentElement.outerHTML

    // initialize match data
    const initialPreviewMatches: PreviewMatches = {}
    cachedKmlTags.forEach((tag: string) => {
      initialPreviewMatches[tag] = {
        label: tag,
        expression: '',
        matches: [],
      }
    })

    // initialize page match data
    const initialPageMatches: PageMatches = {}
    pages.forEach((_: string, index: number) => {
      initialPageMatches[index] = []
    })

    cachedKmlTags.map((tag: string) => {
      const kmlTags: HTMLCollectionOf<Element> = kmlDom.getElementsByTagName(tag)
      if ((kmlTags?.length ?? 0) !== 0) {
        Array.from(kmlTags).map((item: Element) => {
          const matchId: string = generateMatchId()

          let kmlTagStr: string = item.outerHTML
          kmlTagStr = kmlTagStr.replaceAll(/\s?(?:xml)?ns(?:.*)=\".*\"/g, '');
          const tagIndex: number = kmlDomStr.indexOf(kmlTagStr)

          initialPreviewMatches[tag].matches.push({
            match: kmlTagStr,
            matchId: matchId,
            pageNo: 1,
          })

          const pageMatch: PageMatch = {
            pattern: [{
              id: tag,
              label: tag,
            }],
            matchId: matchId,
            match: kmlTagStr,
            startIndex: tagIndex,
            endIndex: tagIndex + kmlTagStr.length,
          }

          initialPageMatches[0].push(pageMatch)
        })
      }
    })

    const markedPages: JSX.Element[] = []

    const initialPageMatch = initialPageMatches[0]
    // no matches on this page
    if (initialPageMatch.length === 0) {
      return markedPages.push(<>{kmlDomStr}</>)
    }
    
    // order the matches on the page
    const sortedData = initialPageMatch
    sortedData.sort((a:any, b:any) => a.startIndex > b.startIndex ? 1 : 0)

    const markedPage: JSX.Element[] = []
    let lastIndex: number = 0
    sortedData.map((d: any, index: number) => {
      markedPage.push(<span key={`${d.matchId}-pretext`}>{kmlDomStr.substring(lastIndex, d.startIndex)}</span>)

      markedPage.push(<Mark
        key={d.matchId}
        pattern={d.pattern}
        matchId={d.matchId}
        text={kmlDomStr.substring(d.startIndex, d.endIndex)}
        onClick={handleMarkClick}
      />)

      if (sortedData.length - 1 === index) {
        markedPage.push(<span key={`${index}-posttext`}>{kmlDomStr.substring(d.endIndex)}</span>)
      }

      lastIndex = d.endIndex
    })
    markedPages.push(<>{markedPage}</>)

    console.log(initialPageMatches)

    setMarkedPages(markedPages)

    setPreviewMatches(initialPreviewMatches)
  }
  // End kml section

  // Start kmz section
  const readKmz = async (file: File) => {
    const kmzData: KmzData = await unzipKmz(file)
    setPages([kmzData.kml])
  }
  // End kmz section

  const reset = () => {
    setPages([])
    setMarkedPages([])
    setFile(null)
    setFocusMatchId(null)
    setFocusPatternId(null)
    setPageNumber(1)
    setPreviewMatches({})
    setShowMatches(false)
  }

  useEffect(() => {
    if (cachedScrollState === 'preview' && pages.length !== 0 && file) {
      if (file.name.toLowerCase().endsWith('.pdf') && Object.keys(cachedRegexState).length > 0) {
        processPdf()
      }
      else if ((file.name.toLowerCase().endsWith('.kml') || file.name.toLowerCase().endsWith('.kmz')) && cachedKmlTags.length > 0) {
        processKml()
      }
      else {
        reset()
      }
    }
  }, [pages, cachedScrollState])

  useEffect(() => {
    if (file !== null) {
      if (file.name.toLowerCase().endsWith('.pdf') && Object.keys(cachedRegexState).length > 0) {
        readPdf(file)
      } else if (file.name.toLowerCase().endsWith('.kml')) {
        readKml(file)
      } else if (file.name.toLowerCase().endsWith('.kmz')) {
        readKmz(file)
      } else {
        dispatch(setNotifState({
          title: `File is not of type(s): ${
            Object.keys(cachedFileTypes)
            .filter(fileType => cachedFileTypes[fileType])
          }`,
          type: 'error',
        }))
      }
    }
  }, [file])

  const importFile = async (file: File) => {
    setFile(file)
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
        style={{ maxWidth: '90%' }}
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
                    {pages.length > 1 && <Pagination
                      count={pages.length}
                      limit={5}
                      onChange={setPageNumber}
                      page={pageNumber}
                    >
                      <Pagination.Next><ChevronRightCircle /></Pagination.Next>
                      <Pagination.Previous><ChevronLeftCircle /></Pagination.Previous>
                    </Pagination>}
                  </Grid>
                  <Grid>
                    <FilePicker
                      extensions={Object.keys(cachedFileTypes).map(suffix => suffix.toLocaleLowerCase())}
                      onChange={importFile}
                      onError={(error: string) => {
                        dispatch(setNotifState({ type: 'error', title: error }))
                      }}
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