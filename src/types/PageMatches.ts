export type PageMatch = {
  regex: {
    id: string,
    label: string,
  }[],
  matchId: string,
  match: string,
  startIndex: number,
  endIndex: number
}

type PageMatches = {
  [pageNo in number]: PageMatch[]
}

export default PageMatches