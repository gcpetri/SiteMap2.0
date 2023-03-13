type PreviewMatches = {
  [id: string]: {
    label: string,
    expression: string,
    matches: {
      match: string,
      matchId: string,
      pageNo: number,
    }[]
  }
}

export default PreviewMatches