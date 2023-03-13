import { useEffect } from "react"

interface PreviewPageProps {
  content: JSX.Element,
  focusMatchId: string|null,
  pageNo: number,
  onMount: (matchId: string) => any,
}

const PreviewPage: React.FC<PreviewPageProps> = (props): React.ReactElement => {
  useEffect(() => {
    if (props.focusMatchId) {
      props.onMount(props.focusMatchId)
    }
  }, [props.pageNo])
  
  return (
    props.content
  )
}

export default PreviewPage