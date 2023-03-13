import { Grid, Select, Text } from "@geist-ui/core"
import { CheckInCircle, XCircle } from '@geist-ui/icons'
import { useDispatch, useSelector } from "react-redux"
import { selectFileState, setFileState, initialState as fileInitialState } from "../../store/fileSlice"
import { config } from "../../utils/config"

interface FileTypesProps{
}

const FileTypes: React.FC<FileTypesProps> = (): React.ReactElement => {

  const dispatch = useDispatch()
  const cachedFileTypes: { [f: string]: boolean } = useSelector(selectFileState)

  return (
    <Grid>
      <Grid.Container gap={1}>
        <Grid style={{ alignSelf: 'center' }}>
          {Object.values(cachedFileTypes).includes(true) ?
            <CheckInCircle color='#0070f3' />
            :
            <XCircle color='red' />
          }
        </Grid>
        <Grid>
          <Text>{'Select file types to consider'}</Text>
        </Grid>
      </Grid.Container>

      <Select
        placeholder='File Types'
        multiple
        value={Object.keys(cachedFileTypes).filter(f => cachedFileTypes[f])}
        width='90%'
        onChange={(val: string|string[]) => {
          const newVals = typeof val === 'string' ? [val] : val
          const newFileTypes: { [f: string]: boolean } = JSON.parse(JSON.stringify(fileInitialState.files))
          newVals.forEach(v => newFileTypes[v] = true)
          dispatch(setFileState(newFileTypes))
        }}
      >
        {config.fileTypes.map(fileType => <Select.Option value={fileType} key={fileType}>{fileType}</Select.Option>)}
      </Select>
    </Grid>
  )
}

export default FileTypes;