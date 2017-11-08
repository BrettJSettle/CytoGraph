import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Sketch from './Sketch.js'
import FA from 'react-fontawesome'
import './css/SettingsEditor.css'

const NODE_SHAPES = ['ellipse', 'triangle','rectangle','roundrectangle',
'bottomroundrectangle','cutrectangle','barrel','rhomboid','diamond',
'pentagon','hexagon','concavehexagon','heptagon','octagon','star','tag','vee']

const LINE_STYLES = ['solid', 'dashed', 'dotted']

const EDGE_TYPES = ['directed', 'undirected', 'bidirectional']

function isColor(val){
	return typeof(val) === 'string' && /^#[0-9A-F]{3,6}$/i.test(val)
}

export default class SettingsPanel extends Component {
	constructor(props){
		super(props)
		this.state = {
			tab: 'nodeStyle',
			...Object.assign({}, window.defaults)
		}
		const DEFAULTS = {}
		Object.keys(window.defaults).forEach(function(k){
			DEFAULTS[k] = Object.assign({}, window.defaults[k])
		})
		this.DEFAULTS = DEFAULTS
	}

	componentDidMount(){
		const main = this;
		window.addEventListener('load', function(){
			window.cy.on('select', function(){
				const eles = main.getCurrentElements()
				let newNodeStyle = {}
				Object.keys(main.state.nodeStyle).forEach(function(k){
					newNodeStyle[k] = eles.nodes().style(k) || main.DEFAULTS['nodeStyle'][k]
				})
				
				let newEdgeStyle = {}
				Object.keys(main.state.edgeStyle).forEach(function(k){
					newEdgeStyle[k] = eles.edges().style(k) || main.DEFAULTS['edgeStyle'][k]
				})
				main.setState({nodeStyle: newNodeStyle, edgeStyle: newEdgeStyle})
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
			if (k === 'background'){
				const el = document.getElementById('cyto')
				console.log(el)
				el.style['background'] = v
			}
		}else if(this.state.tab.endsWith('Data')){
			const eles = this.getCurrentElements()
			eles.data(k, v)
		}else{
			const eles = this.getCurrentElements()
			eles.style(k, v)
		}
	}

	getCurrentElements = () => {
		if (!window.cy){
			return undefined;
		}

		const elementType = this.state.tab.slice(0, 4)
		if (elementType === 'core'){
			return undefined
		}else if (elementType === 'node'){
			let nodes = window.cy.nodes(':selected')
			if (nodes.length === 0)
				nodes = window.cy.nodes()
			return nodes
		}else if (elementType === 'edge'){
			let edges = window.cy.edges(':selected')
			if (edges.length === 0)
				edges = window.cy.edges()
			return edges
		}
	}

	makeSelect = (key, value, options) => {
		const opts = options.map(function(opt, k){
			return <option key={k} value={opt}>{opt}</option>
		})
		return <select value={value} onChange={(v) => this.handleChange(key, v.target.value)}>
			{opts}
		</select>
	}

	getRows(data){
		const main = this;
		const elements = this.getCurrentElements()
		return Object.keys(data).map(function(key, k) {
			const elementType = main.state.tab.slice(0, 4)
			let value = data[key]
			let renderedValue = data[key]
			
			if (elementType === 'core'){

			} else if (main.state.tab.endsWith('Data')){
				if (elementType === 'node'){
				
				}else if (elementType === 'edge'){
					if (key === 'type'){
						renderedValue = main.makeSelect(key, renderedValue, EDGE_TYPES)
					}
				}
			}else{
				// Get rendered style if it exists
				if (elements !== undefined){
					if (elements.style() && typeof elements.numericStyle(key) === 'number'){
						renderedValue === elements.numericStyle(key)
					}else{
						renderedValue = elements.renderedStyle(key)
					}
				}
				// generate component if possible
				if (key === 'line-style'){
					renderedValue = main.makeSelect(key, renderedValue, LINE_STYLES)
				}else if (key === 'shape'){
					renderedValue = main.makeSelect(key, renderedValue, NODE_SHAPES)
				}
			}
			// change component based on value type
			if (typeof renderedValue === 'number' || /^[0-9.]$/.test(renderedValue)){
				renderedValue = <input
					type='number'
					value={renderedValue}
					onChange={(v) => main.handleChange(key, parseFloat(v.target.value))}/>
			}else if (isColor(renderedValue)){
				renderedValue = <Sketch color={renderedValue} onChange={(v) => main.handleChange(key, v)}/>
			}

			return (<tr key={k}>
					<td>{key}</td>
					<td><input
						onChange={(v) => main.handleChange(key, v.target.value)}
						type='text'
						value={value}/></td>
					<td>{renderedValue}</td>
					<td><Button
					  className="reset"
						style={{padding: '3px'}}
						onClick={() => main.handleChange(key, main.DEFAULTS[main.state.tab][key])}>
						<FA name="repeat" flip='horizontal'/>
						</Button></td>
				</tr>)
		});
	}

	render(){
		const data = this.state[this.state.tab]
		const main = this;

		const rows = data === undefined ? [] : this.getRows(data)
		
		return (
			<div className='SettingsPanel'>
				<table className='SettingsPanel-mode'>
					<thead>
						<tr>
							<th><Button onClick={() => main.setState({tab: 'nodeStyle'}) }>Nodes</Button></th>
							<th><Button onClick={() => main.setState({tab: 'edgeStyle'}) }>Edges</Button></th>
							<th><Button onClick={() => main.setState({tab: 'edgeData'}) }>Edge Data</Button></th>
							<th><Button onClick={() => main.setState({tab: 'core'}) }>Core</Button></th>
						</tr>
					</thead>
				</table>
				<table className='SettingsPanel-table'>
					<thead>
						<tr>
							<th>Name</th>
							<th>Input</th>
							<th>Value</th>
							<th style={{width: '30px'}}><FA name="repeat" flip='horizontal'/></th>
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
