import { Button, Grid, Input, Link, Table } from "@geist-ui/core"
import { CheckInCircle, Plus, X, XCircle } from '@geist-ui/icons'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Regex, selectRegexState, setRegexState, updateRegexState } from "../../store/regexSlice"

interface RegexComponentProps {
}

const RegexComponent: React.FC<RegexComponentProps> = (): React.ReactElement => {

  const dispatch = useDispatch()

  const cachedRegexState: Regex[] = useSelector(selectRegexState)

  useEffect(() => console.log(cachedRegexState), [cachedRegexState])

  const renderUpdateLabelAction = (value: any, rowData: any, i: number) => {
    const updateHandler = (newRegex: Regex) => {
      if (newRegex.label !== rowData.label)
        dispatch(updateRegexState({ updated: newRegex, oldExpression: rowData.expression }))
    }

    const [editLabel, setEditLabel] = useState<boolean>(false);

    return (
      <>
      {!editLabel
        ? 
          <Button
            type='abort'
            auto
            padding={0}
            onClick={() => setEditLabel(true)}
          >
            {value}
          </Button>
        :
          <Input
            initialValue={rowData.label}
            onKeyDownCapture={(e) => {
              if (e.key === 'Enter') {
                const newRegex: Regex = {
                  ...rowData, // @ts-ignore
                  label: e.target.value,
                }
                updateHandler(newRegex)
              }
            }}
            onBlurCapture={(e) => {
              const newRegex: Regex = {
                ...rowData, // @ts-ignore
                label: e.target.value,
              }
              updateHandler(newRegex)
              setEditLabel(false)
            }}
          />
      }
      </>
    )
  }

  const renderUpdateExpressionAction = (value: any, rowData: any, i: number) => {
    const updateHandler = (newRegex: Regex) => {
      if (newRegex.expression !== value && !cachedRegexState.map(r => r.expression).includes(newRegex.expression))
        dispatch(updateRegexState({ updated: newRegex, oldExpression: rowData.expression }))
    }

    const [currentRegex, setCurrentRegex] = useState<string>('')
    const [type, setType] = useState<'default'|'error'|'success'>('default')

    useEffect(() => {
      setCurrentRegex(value)
    }, [value])

    useEffect(() => {
      if (cachedRegexState.map(r => r.expression).includes(currentRegex))
        setType('error')
      else if (value.length > 0 && currentRegex.length === 0)
        setType('error')
      else
        setType('success')
    }, [currentRegex])

    return (
      <Input
        label='/'
        labelRight='/msgi'
        width='100%'
        initialValue={rowData.expression}
        value={currentRegex}
        type={value === currentRegex ? 'default' : type}
        onChange={e => setCurrentRegex(e.target.value)}
        placeholder='regular expression goes here'
        onKeyDownCapture={(e) => {
          if (e.key === 'Enter') {
            const newRegex: Regex = {
              ...rowData, // @ts-ignore
              expression: currentRegex,
            }
            updateHandler(newRegex)
          }
        }}
        onBlurCapture={(e) => {
          const newRegex: Regex = {
            ...rowData, // @ts-ignore
            expression: currentRegex,
          }
          updateHandler(newRegex)
        }}
      />
    )
  }

  const renderRemoveAction = (_:any, rowData: any, i: number) => {
    const removeHandler = () => {
      dispatch(setRegexState(cachedRegexState.filter(regexState => (regexState.expression !== rowData.expression))))
    }
    return (
      <Button iconRight={<X color='red' />} auto type='abort' scale={2/3} px={0.6} onClick={removeHandler} />
    )
  }

  return (
    <Grid>
      <Grid.Container gap={1}>
        <Grid style={{ alignSelf: 'center' }}>
          {cachedRegexState.find(r => r.expression.length > 0) ?
            <CheckInCircle color='#0070f3' />
            :
            <XCircle color='red' />
          }
        </Grid>
        <Grid style={{ alignSelf: 'center' }}>
          <span className='hide-on-small'>{'Add '}</span>
          <Link
            href='https://regex101.com/'
            target='_blank' 
            icon
            color
          >regular expression(s)
          </Link>
          <span className='hide-on-small'>{' that match text in pdf files'}</span>
        </Grid>
      </Grid.Container>

      <Grid.Container gap={1} direction='column'>
        <Grid style={{ maxHeight: '140px', overflowY: 'scroll'}}>
          <Table data={cachedRegexState}>
            <Table.Column prop='label' label='label' render={renderUpdateLabelAction} />
            <Table.Column prop='expression' label='expression' render={renderUpdateExpressionAction} />
            <Table.Column prop='operation' label='' render={renderRemoveAction} />
          </Table>
        </Grid>
        <Grid xs={8}>
          <Button
            scale={0.85}
            type='success-light'
            h={0.75}
            disabled={cachedRegexState.map(r => r.expression).includes('')}
            icon={<Plus />}
            auto
            onClick={(e) => {
              const newRegex: Regex = {
                id: `rg${uuidv4().replaceAll('-', '')}`,
                label: `Expr ${cachedRegexState.length + 1}`,
                expression: '',
                operation: '',
              }
              dispatch(setRegexState([...cachedRegexState, newRegex]))
            }}
          ><span className='hide-on-small'>Add Expression</span>
          </Button>
        </Grid>
      </Grid.Container>
    </Grid>
  )
}

export default RegexComponent;