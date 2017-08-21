// src/components/App/index.js
import React, { Component } from 'react';
import CytoscapeComponent from './CytoscapeComponent.js'
import Footer from './Footer.js'
import './css/style.css';


class App extends Component {
	constructor(props){
		super(props)
		this.cy = null
	}

	render() {
		const app = this;

		return (
			<div className='App'>
				<CytoscapeComponent 
					ref={function(cy) { app.cy = cy }}
				/>
				<Footer />
			</div>
		);
	}
}

export default App;

