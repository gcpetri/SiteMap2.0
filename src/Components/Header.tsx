import { Grid, Spacer, Text } from "@geist-ui/core"

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
        zIndex: '1000'
      }}
    >
      <Grid.Container
        height='100%'
        direction='column'
      >
        <Grid>
          <Text b>SiteMap</Text>
        </Grid>
        <Grid
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem'
          }}
        >
          <span className='hide-on-small'>Generate a KMZ for Google Earth!</span>
        </Grid>
      </Grid.Container>
    </div>
  )
}

export default Header