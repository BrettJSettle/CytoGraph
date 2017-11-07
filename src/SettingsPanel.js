import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Sketch from './Sketch.js'
import FA from 'react-fontawesome'
import './css/SettingsEditor.css'

function isColor(val){
	return typeof(val) === 'string' && /^#[0-9A-F]{3,6}$/i.test(val)
}

export default class SettingsPanel extends Component {
	DEFAULTS = Object.assign(window.defaults)
	constructor(props){
		super(props)
		this.state = {
			tab: 'nodeStyle',
			elements: undefined,
			...Object.assign(window.defaults)
		}
	}

	componentDidMount(){
		const main = this;
		window.addEventListener('load', function(){
			window.cy.on('select unselect', function(){
				const eles = window.cy.elements(':selected')
				main.setState({elements: eles})
			})
		})
	}

	handleChange = (k, v) => {
		const elementType = this.state.tab.slice(0, 4)
		const newDefaults = Object.assign({}, this.state[this.state.tab])
		newDefaults[k] = v
		this.setState({[this.state.tab]: newDefaults})
		window.defaults[this.state.tab][k] = v

		if (elementType === 'core'){
			
		}else if (this.state.elements !== undefined){
			const eles =  elementType === 'node' ? this.state.elements.nodes() : this.state.elements.edges()
			eles.style(k, v)
		}
	}

	render(){
		const data = this.state[this.state.tab]
		const main = this;
		const rows = data === undefined ? [] : Object.keys(data).map(function(key, k) {
			const elementType = main.state.tab.slice(0, 4)
			let value = data[key]
			let renderedValue = data[key]

			if (elementType === 'core'){
				
			}else if (main.state.elements !== undefined){
				const eles = elementType === 'node' ? main.state.elements.nodes() : main.state.elements.edges()
				renderedValue = eles.renderedStyle(key)
				if (typeof eles.numericStyle(key) === 'number'){
					renderedValue = <input type='number' value={eles.numericStyle(key)} onChange={(v) => main.handleChange(key, parseFloat(v.target.value))}/>
				}
			}else{
				console.log(value + ' is a ' + typeof value)
				if (typeof value === 'number' || /^[0-9\.]$/.test(value)){
					renderedValue = <input type='number' value={value} onChange={(v) => main.handleChange(key, parseFloat(v.target.value))}/>
				}
			}


			if (isColor(value)){
				renderedValue = <Sketch color={value} onChange={(v) => main.handleChange(key, v)}/>
			}
			return (<tr key={k}>
					<td>{key}</td>
					<td><input onChange={(v) => main.handleChange(key, v.target.value)} type='text' value={value}/></td>
					<td>{renderedValue}</td>
					<td><Button style={{padding: '3px'}} onClick={() => main.handleChange(key, main.DEFAULTS[main.state.tab][key])}><FA name="repeat" flip='horizontal'/></Button></td>
				</tr>)
		})
		return (
			<div className='SettingsPanel'>
				<table className='SettingsPanel-mode'>
					<thead>
						<tr>
							<th><Button onClick={() => this.setState({tab: 'nodeStyle'}) }>Nodes</Button></th>
							<th><Button onClick={() => this.setState({tab: 'edgeStyle'}) }>Edges</Button></th>
							<th><Button onClick={() => this.setState({tab: 'edgeData'}) }>Edge Data</Button></th>
							<th><Button onClick={() => this.setState({tab: 'core'}) }>Core</Button></th>
						</tr>
					</thead>
				</table>
				<table className='SettingsPanel-table'>
					<thead>
						<tr>
							<th>Name</th>
							<th>Input</th>
							<th>Value</th>
							<th style={{width: '50px'}}><FA name="repeat" flip='horizontal'/></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		)
	}
}
