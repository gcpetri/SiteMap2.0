import { Regex } from "../store/regexSlice"

type SettingsFile = {
  instructions: string,
  fileTypes: { [f: string]: boolean }
  regex: Regex[],
  kmlTags: string[],
}

export default SettingsFile