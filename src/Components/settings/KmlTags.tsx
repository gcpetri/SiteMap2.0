import { Grid, Link, Select } from "@geist-ui/core"
import { CheckInCircle, XCircle } from '@geist-ui/icons'
import { useDispatch, useSelector } from "react-redux"
import { selectKmlState, setKmlState } from "../../store/kmlSlice"
import { config } from "../../utils/config"

interface KmlTagsProps {
}

const KmlTags: React.FC<KmlTagsProps> = (): React.ReactElement => {

  const dispatch = useDispatch()
  const cachedKmlTags: string = useSelector(selectKmlState)

  return (
    <Grid>
      <Grid.Container gap={1}>
        <Grid style={{ alignSelf: 'center' }}>
          {cachedKmlTags.length > 0 ?
            <CheckInCircle color='#0070f3' />
            :
            <XCircle color='red' />
          }
        </Grid>
        <Grid style={{ alignSelf: 'center' }}>
          <span className='hide-on-small'>{'Add '}</span>
          <Link
            href='https://developers.google.com/kml/documentation/kmlreference'
            target='_blank'
            icon
            color
          >KML tag(s)
          </Link>
          <span className='hide-on-small'>{' that match tags in KML or KMZ files'}</span>
        </Grid>
      </Grid.Container>

      <Grid.Container direction='column'>
        <Grid>
          <Select
            placeholder='Tags'
            multiple
            initialValue={cachedKmlTags}
            value={cachedKmlTags}
            width='90%'
            onChange={(val: string|string[]) => dispatch(setKmlState(typeof val === 'string' ? [val] : val))}
          >
            {config.kmlTagOptions.map(name => <Select.Option value={name} key={name}>{name}</Select.Option>)}
          </Select>
        </Grid>
      </Grid.Container>
    </Grid>
  )
}

export default KmlTags;