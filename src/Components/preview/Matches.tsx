import { Code, Collapse, Grid, Text } from "@geist-ui/core"
import { useEffect, useRef } from "react"
import PreviewMatches from "../../types/PreviewMatches"

interface MatchesProps {
  focusPatternId: string|null,
  focusMatchId: string|null,
  previewMatches: PreviewMatches,
  onClick: (pageNo: number, patternId: string, matchId: string) => any,
}

const Matches: React.FC<MatchesProps> = (props): React.ReactElement => {
  const COLLAPSE_PREFIX = 'collapse'
  const COLLAPSE_MATCH_PREFIX = 'collapse-line'

  const matchesParentRef = useRef<HTMLDivElement>(null)

  const getCollapseId = (id: string) => {
    return COLLAPSE_PREFIX + '-' + id
  }

  const getCollapseLineId = (id: string) => {
    return COLLAPSE_MATCH_PREFIX + '-' + id
  }

  const highLight = (ele: HTMLElement) => {
    ele.animate(
      [{ backgroundColor: '#0070f3' }, { backgroundColor: 'transparent' }],
      { duration: 1500, fill: "forwards" }
    )
    ele.focus()
  }

  const focusOnMatch = () => {
    const collapse = document.querySelector(`#${getCollapseId(props.focusPatternId || '')}`) as HTMLElement
    if (collapse) {
      const matchLine = collapse.querySelector(`#${getCollapseLineId(props.focusMatchId || '')}`) as HTMLElement
      if (matchLine) {
        matchLine.scrollIntoView({block: 'center', inline: 'center', behavior: 'smooth'})
        highLight(matchLine)
      }
    }
  }

  const handleFocusOnMark = (ele: HTMLElement, pageNo: number, patternId: string, matchId: string) => {
    highLight(ele)
    props.onClick(pageNo, patternId, matchId)
  }

  useEffect(() => {
    if (props.focusMatchId && props.focusPatternId) {
      focusOnMatch()
    }
  }, [])

  return (
    <div
      ref={matchesParentRef}
    >
      <Collapse.Group>
        {Object.entries(props.previewMatches).map(([patternId, value]: [string, any]) => (
          <Collapse
            id={getCollapseId(patternId)}
            title={`${value.label} (${value.matches.length})`}
            key={patternId}
            subtitle={<Text small b>{value.expression}</Text>}
            initialVisible={patternId === props.focusPatternId}
          >
            <>
              {value.matches.map((match: any, i: number) => (
                <Grid.Container
                  id={getCollapseLineId(match.matchId)}
                  key={i}
                  direction='row'
                  role='button'
                  justify='space-between'
                  onClick={(e: any) => handleFocusOnMark(e.target, match.pageNo, patternId, match.matchId)}
                  marginBottom='3px'
                  style={{
                    borderRadius: '5px',
                    paddingLeft: '2px',
                    cursor: 'pointer',
                  }}
                >
                  <Grid
                    style={{
                      pointerEvents: 'none',
                      maxInlineSize: '400px',
                      wordWrap: 'break-word',
                      maxHeight: '50px',
                      overflow: 'hidden'
                    }}
                  >
                    {match.match}
                  </Grid>
                  <Grid
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                      paddingLeft: '2px',
                      paddingRight: '2px',
                      backgroundColor: '#DDD',
                      borderRadius: '2px'
                    }}
                  >
                    <Code my={0}>
                      {`P${match.pageNo}`}
                    </Code>
                  </Grid>
                </Grid.Container>
              ))}
            </>
          </Collapse>
        ))}
      </Collapse.Group>
    </div>
  )
}

export default Matches