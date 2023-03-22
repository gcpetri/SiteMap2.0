import { Button, Grid, Text } from "@geist-ui/core"
import { ChevronDown } from "@geist-ui/icons"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectScrollState, setScrollState } from "../store/scrollSlice"
import { selectSettingsValidState } from "../store/settingsValidSlice"

interface ScrollProps {
  section: string,
  disabled?: boolean,
}

const Scroll: React.FC<ScrollProps> = (props): React.ReactElement => {
  const dispatch = useDispatch()

  const PAGES: string[] = ['settings', 'preview', 'scraper', 'results']
  const DEFAULT_PAGE: string = PAGES[0]

  const cachedSettingsValid: boolean = useSelector(selectSettingsValidState)
  const cachedScrollState: string = useSelector(selectScrollState)

  const refreshElements = () => {
    const elements: {
      [s in string]: HTMLElement
    } = {}
    PAGES.map((str: string) => elements[str] = document.querySelector(`#${str}-page`) as HTMLElement)
    return elements
  }

  useEffect(() => {
    const elements = refreshElements()
    const currentPg: string|undefined = Object.keys(elements).find((str: string) => elements[str] && elements[str].getBoundingClientRect().top === 0)
    dispatch(setScrollState(currentPg || DEFAULT_PAGE))
  }, [])

  const onNextClick = () => {
    const elements = refreshElements()
    PAGES.map((pageName: string, index: number) => {
      if (elements[pageName]
        && elements[pageName].getBoundingClientRect().top === 0
        && index !== PAGES.length - 1
        && elements[PAGES[index + 1]]) {
        dispatch(setScrollState(PAGES[index + 1]))
        elements[PAGES[index + 1]].scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  const onBackClick = () => {
    const elements = refreshElements()
    PAGES.map((pageName: string, index: number) => {
      if (elements[pageName]
        && elements[pageName].getBoundingClientRect().top < 200
        && index !== 0
        && elements[PAGES[index - 1]]) {
        dispatch(setScrollState(PAGES[index - 1]))
        elements[PAGES[index - 1]].scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  return (
    <div id='scroll-component'>
      <Grid.Container>
        <Grid>
          {cachedScrollState !== PAGES[0] && <Button
            auto
            type='abort'
            paddingTop={0.8}
            scale={0.6}
            onClick={onBackClick}
          >
            {'< Back'}
          </Button>}
        </Grid>
        <Grid>
          <Grid.Container justify='center' direction='column' alignItems='center'>
            <Grid>
              <Button
                id='scroll-next-btn'
                auto
                type='warning'
                disabled={!cachedSettingsValid && cachedScrollState !== PAGES[PAGES.length - 1]}
                onClick={onNextClick}
              >
                <Text b>{'Next'}</Text>
                <Text>{`: ${props.section}`}</Text>
              </Button>
            </Grid>
            <Grid id='scroll-down-icon'>
              <ChevronDown />
            </Grid>
          </Grid.Container>
        </Grid>
      </Grid.Container>
    </div>
  )
}

export default Scroll