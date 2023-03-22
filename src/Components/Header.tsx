import { Grid, Spacer, Text } from "@geist-ui/core"
import { config } from "../utils/config"

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = (): React.ReactElement => {
  return (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        top: '0',
        width: 'fit-content',
        height: 'fit-content',
        maxHeight: '40px',
        padding: '6px',
        borderRadius: '0px 0px 6px 6px',
        backgroundColor: '#0070f3',
        color: 'white',
        zIndex: '1000',
        pointerEvents: 'none'
      }}
    >
      <Grid.Container
        height='100%'
        direction='column'
      >
        <Grid>
          <Text b id='app-name'>{config.appName}</Text>
        </Grid>
        <Grid
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem'
          }}
        >
          <span className='hide-on-small' id='app-description'>{config.appDescription}</span>
        </Grid>
      </Grid.Container>
    </div>
  )
}

export default Header