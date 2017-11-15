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

const SETTINGS_PROPERTIES = {
	core: {
		grid: {
			name: 'grid nodes',
			textInput: false,
		},
		selectionType: {
			options: ['single', 'additive'],
			textInput: false,
		}
	},
	edgeStyle: {
		'text-rotation': {
			description: 'Angle in radians, "none", or "autorotate"',
		},
		'line-style': {
			options: LINE_STYLES,
		},
	},
	edgeData: {
		type: {
			options: EDGE_TYPES,
		}
	},
	nodeStyle: {
		shape: {
			options: NODE_SHAPES,
		}
	},
	nodeData: {

	}
}

function isColor(val){
	return typeof(val) === 'string' && /^#[0-9A-F]{3,6}$/i.test(val)
}

export default class SettingsPanel extends Component {
	constructor(props){
		super(props)
		this.state = {
			tab: 'node',
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

	handleChange = (type, k, v) => {
		const elementType = type.slice(0, 4)
		const newDefaults = Object.assign({}, this.state[type])
		newDefaults[k] = v
		this.setState({[type]: newDefaults})
		window.defaults[type][k] = v

		if (elementType === 'core'){
			if (k === 'background'){
				const el = document.getElementById('cyto')
				el.style['background'] = v
			}else if (k === 'grid'){
				window.cy.snapToGrid(v ? 'snapOn' : 'snapOff')
				window.cy.snapToGrid(v ? 'gridOn' : 'gridOff')
			}else if (k === 'selectionType'){
				window.cy._private.selectionType = v
			}
		}else if(type.endsWith('Data')){
			const eles = this.getCurrentElements()
			eles.data(k, v)
		}else{
			const eles = this.getCurrentElements()
			eles.style(k, v)
		}
		if (k === 'line-color'){
			this.handleChange('edgeStyle', 'target-arrow-color', v)
			this.handleChange('edgeStyle', 'source-arrow-color', v)

		}
	}

	getCurrentElements = () => {
		if (!window.cy){
			return undefined;
		}

		if (this.state.tab === 'core'){
			return undefined
		}else if (this.state.tab === 'node'){
			let nodes = window.cy.nodes(':selected')
			if (nodes.length === 0)
				nodes = window.cy.nodes()
			return nodes
		}else if (this.state.tab === 'edge'){
			let edges = window.cy.edges(':selected')
			if (edges.length === 0)
				edges = window.cy.edges()
			return edges
		}
	}

	makeSelect = (tab, key, value, options) => {
		const opts = options.map(function(opt, k){
			return <option key={k} value={opt}>{opt}</option>
		})
		return <select value={value} onChange={(v) => this.handleChange(tab, key, v.target.value)}>
			{opts}
		</select>
	}

	getRows(tab){
		const main = this;
		const elements = this.getCurrentElements()
		const data = this.state[tab]


		return Object.keys(data).map(function(key, k) {
			let value = data[key]
			let renderedValue = data[key]
			let name = key
			let description = undefined

			if (tab === 'core'){

			} else if (tab.endsWith('Data')){
				if (tab.startsWith('node') && elements){
					renderedValue = elements.nodes().data(key) || ''
					value = elements.nodes().data(key) || ''

				}else if (tab.startsWith('edge')){
					renderedValue = elements.edges().data(key) || ''
					value = elements.edges().data(key)
				}
			}else{
				if (key === 'target-arrow-color' || key === 'source-arrow-color'){
					return undefined
				}
				// Get rendered style if it exists
				if (elements !== undefined && elements.style() !== undefined){
					try{
						const num = elements.numericStyle(key)
						if (typeof num === 'number'){
							renderedValue = num
						}else{
							renderedValue = elements.renderedStyle(key)
						}
					}catch(e){

					}
				}
			}
			const props = SETTINGS_PROPERTIES[tab][key]
			if (props){
				if (props['name'])
					name = props['name']
				if (props['description'])
					description = props['description']
				if (props['options'])
					renderedValue = main.makeSelect(tab, key, renderedValue, props['options'])
				if (props.textInput === false){
					value = null;
				}
			}

			// change component based on value type
			if (typeof renderedValue === 'number' || /^[0-9.]$/.test(renderedValue)){
				renderedValue = <input
					type='number'
					value={renderedValue}
					onChange={(v) => main.handleChange(tab, key, parseFloat(v.target.value))}/>
			}else if (isColor(renderedValue)){
				renderedValue = <Sketch color={renderedValue} onChange={(v) => main.handleChange(tab, key, v)}/>
			}else if (typeof renderedValue === 'boolean'){
				value = null;
				renderedValue = <input
					type='checkbox'
					checked={renderedValue}
					onChange={(v) => main.handleChange(tab, key, v.target.checked)}/>
			}

			let nameStyle = {'cursor': 'default'}
			if (description)
				nameStyle = Object.assign(nameStyle, {textDecoration: 'underline', textDecorationStyle: 'dotted'})
			return (<tr key={k}>
					<td title={description} style={nameStyle}>{name}</td>
					<td>{value !== null && <input
						onChange={(v) => main.handleChange(tab, key, v.target.value)}
						type='text'
						value={value}/>}</td>
					<td>{renderedValue}</td>
					<td><Button
					  className="reset"
						onClick={() => main.handleChange(tab, key, main.DEFAULTS[tab][key])}>
							<FA name="repeat" flip='horizontal'/>
						</Button></td>
				</tr>)
		});
	}

	getTables = () => {
		if (this.state.tab === 'core'){
			return (<tbody>
				{this.getRows('core')}
				</tbody>)
		}else if (this.state.tab === 'node'){
			const dataTable = this.getRows('nodeData')
			const styleTable = this.getRows('nodeStyle')
			return (<tbody>
				{dataTable}
				<tr>
					<td className='separator'></td>
					<td className='separator'></td>
					<td className='separator'></td>
					<td className='separator'></td>
				</tr>
				{styleTable}
			</tbody>)
		}else if (this.state.tab === 'edge'){
			const dataTable = this.getRows('edgeData')
			const styleTable = this.getRows('edgeStyle')
			return (<tbody>
				{dataTable}
				<tr>
					<td className='separator'></td>
					<td className='separator'></td>
					<td className='separator'></td>
					<td className='separator'></td>
				</tr>
				{styleTable}
			</tbody>)
		}
	}

	render(){
		const main = this;
		const rows = this.getTables()

		const tabNames = {node: 'Nodes', edge: 'Edge', core: 'Core'}

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
									onClick={() => {
										const keys = main.state.tab === 'core' ? ['core'] : [main.state.tab + 'Data', main.state.tab + 'Style']
										keys.forEach(tab => {
											Object.keys(main.DEFAULTS[tab]).forEach((key) => {
												main.handleChange(tab, key, main.DEFAULTS[tab][key])
											})
										})
									}
									}>
										<FA name="repeat" flip='horizontal'/>
									</Button>
							</th>
						</tr>
					</thead>
					{rows}
				</table>
			</div>
		)
	}
}
