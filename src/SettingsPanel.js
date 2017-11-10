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
				if (eles === undefined)
					return
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
		if (k === 'line-color'){
			this.handleChange('target-arrow-color', v)
			this.handleChange('source-arrow-color', v)

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
					renderedValue = elements.nodes().data('label') || ''
					value = elements.nodes().data('label') || ''

				}else if (elementType === 'edge'){
					if (key === 'type'){
						renderedValue = main.makeSelect(key, renderedValue, EDGE_TYPES)
					}
				}
			}else{
				// Get rendered style if it exists
				if (elements !== undefined && elements.style() !== undefined){
					let num = ''
					try{
						num = elements.numericStyle(key)
						if (typeof num === 'number'){
							renderedValue = num
						}else{
							renderedValue = elements.renderedStyle(key)
						}
					}catch(e){

					}
				}
				// generate component if possible
				if (key === 'target-arrow-color' || key === 'source-arrow-color'){
					return
				}if (key === 'line-style'){
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
		let data = this.state[this.state.tab]
		const main = this;
		if (this.state.tab === 'nodeData'){
			data['label'] = ''
		}
		//const eles = this.getCurrentElements()
		//if (eles !== undefined && eles.length > 0){
		//	data = this.state.tab.endsWith('Style') ? eles.style() : eles.data()
		//}
		const rows = data === undefined ? [] : this.getRows(data)

		const tabNames = {nodeData: 'Node Data', edgeData: 'Edge Data', nodeStyle: 'Node Style', edgeStyle: 'Edge Style', core: 'Core'}
		const tabs = Object.keys(tabNames).map(function(name, k){
			return <th key={k}><Button
					className={"SettingsPanel-tab" + (main.state.tab === name ? ' active' : '')}
					onClick={() => main.setState({tab: name}) }>{tabNames[name]}</Button>
				</th>
		})
		return (
			<div className='SettingsPanel'>
				<table className='SettingsPanel-mode'>
					<thead>
						<tr>
							{tabs}
						</tr>
					</thead>
				</table>
				<table className='SettingsPanel-table'>
					<thead>
						<tr>
							<th>Name</th>
							<th>Input</th>
							<th>Value</th>
							<th style={{width: '30px'}}>
								<Button
									className="reset"
									style={{padding: '3px'}}
									onClick={() => Object.keys(main.DEFAULTS[main.state.tab]).forEach((key) => main.handleChange(key, main.DEFAULTS[main.state.tab][key]))}>
										<FA name="repeat" flip='horizontal'/>
									</Button>
							</th>
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
