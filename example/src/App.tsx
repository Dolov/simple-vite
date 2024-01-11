import React from 'react'
import Count from './components/Count.tsx'
import reactLogo from './assets/react.svg'
import './style.css'

export interface AppProps {

}

const App: React.FC<AppProps> = props => {
	const { } = props

	return (
		<div>
			<Count />
			<img src={reactLogo} alt="" />
		</div>
	)
}

export default App
