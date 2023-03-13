import { cleanUpGps } from "./scrapper"

export const regExpFlags: string = 'gsi'

export const generateRegexStr = (regexItems: string[]): string => {
  let regexStr: string = ''
  regexItems.forEach((item:string, index:number) => index === regexItems.length - 1 ? regexStr += item : regexStr += `${item}|`)
  return regexStr
}

export const getRegexMatches = async (regex:RegExp, text:string): Promise<string[]> => {
  if ((text?.length ?? 0) === 0)
    return []

  const matches: string[] = Array.from(text.matchAll(regex), m => {
    const match: string|string[] = m[0]
    let cleanMatches: string = ''
    if (Array.isArray(match))
      cleanMatches = match.map((multiMatch:string) => cleanUpGps(multiMatch)).flat().toString()
    else
      cleanMatches = cleanUpGps(match)
    return cleanMatches
  })

  if (matches.length === 0)
    return []

  return matches.flat()
}
