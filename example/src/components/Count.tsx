
import React from 'react'

export interface CountProps {
  
}

const Count: React.FC<CountProps> = props => {
  const {  } = props
  const [count, setCount] = React.useState(10)
  return (
    <button className="count" onClick={() => setCount(count+1)}>{count}</button>
  )
}

export default Count
