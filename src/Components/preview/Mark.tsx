import { Badge, Button, Link, Tooltip } from "@geist-ui/core"

interface MarkProps {
  pattern: {
    id: string,
    label: string,
  }[],
  matchId: string,
  text: string,
  onClick: (patternId: string, matchId: string) => any,
}

const Mark: React.FC<MarkProps> = (props): React.ReactElement => {

  return (
    <Tooltip 
      text={
        <>
          Matches
          <br></br>
          {props.pattern
            .map((r: { id: string, label: string }, index: number) => (
              <Button
                key={index}
                type='abort'
                auto
                scale={0.35}
                marginRight='10px'
                onClick={() => props.onClick(r.id, props.matchId)}
                padding={0}
                style={{
                  color: '#0070f3'
                }}
              >{r.label}</Button>
            ))}
        </>
      }
      type='dark'
      style={{
        width: 'auto'
      }}
    >
      <Badge
        key={props.matchId}
        id={props.matchId}
        type='warning'
        padding={0.5}
        style={{wordWrap: 'break-word'}}
      >
        {props.text}
      </Badge>
    </Tooltip>
  )
}

export default Mark