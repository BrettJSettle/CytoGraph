import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Sketch from './Sketch.js'
import ExportDialog from './ExportDialog.js'
import FA from 'react-fontawesome'
import './css/SettingsEditor.css'

const NODE_SHAPES = ['ellipse', 'triangle','rectangle','roundrectangle',
'bottomroundrectangle','cutrectangle','barrel','rhomboid','diamond',
'pentagon','hexagon','concavehexagon','heptagon','octagon','star','tag','vee']

const LINE_STYLES = ['solid', 'dashed', 'dotted']

const EDGE_TYPES = ['directed', 'undirected', 'bidirectional']

const LAYOUTS = ['preset', 'grid', 'concentric', 'circle', 'random', 'breadthfirst', 'cose']

const CORE_ACTIONS = {
	'fit to sceen': function(){
		window.cy.fit()
	},
	'make complete': function(){
		var toAdd = []
		for(var i = 0; i < window.cy.nodes().length; i++){
			var el = window.cy.nodes()[i];
			for (var j = i + 1; j < window.cy.nodes().length; j++){
				var el2 = window.cy.nodes()[j];
				if (el.edgesWith(el2).length === 0){
					toAdd.push({'group': 'edges', 'data': {'source': el.id(), 'target': el2.id()}});
				}
			}
		}
		window.undoRedo.do('add', toAdd);
	},
	'export': function(main){
		main.setState({exporting: true})
	}
}

const SETTINGS_PROPERTIES = {
	core: {
		grid: {
			name: 'grid nodes',
		},
		selectionType: {
			options: ['single', 'additive'],
			enableInput: false,
		},
		layout: {
			options: LAYOUTS,
			enableInput: false
		},
	},
	edgeStyle: {
		'text-rotation': {
			description: 'Angle in radians, "none", or "autorotate"',
		},
		'line-style': {
			options: LINE_STYLES,
		},
		color: {
			name: 'text color',
		},
		'background-color': {
			name: 'line color'
		}
	},
	edgeData: {
		id: {
			enableInput: false,
		},
		type: {
			options: EDGE_TYPES,
		},
		source: {
			enableInput: false,
		},
		target: {
			enableInput: false,
		}
	},
	nodeStyle: {
		shape: {
			options: NODE_SHAPES,
		},
		color: {
			name: 'text color',
		},
		'background-color': {
			name: 'node color'
		}
	},
	nodeData: {
		id: {
			enableInput: false,
		},
	}
}

function isColor(val){
	return typeof(val) === 'string' && /^#[0-9A-F]{3,6}$/i.test(val)
}

export default class SettingsPanel extends Component {
	constructor(props){
		super(props)
		// add defaults to state, THESE VALUES CHANGE AND CAN BE INVALID
		// window.defaults are set to renderedStyle version of state defaults
		// DO NOT CHANGE this.DEFAULTS
		this.state = {
			tab: 'node',
			exporting: true,
			core: Object.assign({}, window.defaults.core),
			nodeData: Object.assign({}, window.defaults.nodeData),
			nodeStyle: Object.assign({}, window.defaults.nodeStyle),
			edgeData: Object.assign({}, window.defaults.edgeData),
			edgeStyle: Object.assign({}, window.defaults.edgeStyle),
		}
		const DEFAULTS = {}
		Object.keys(window.defaults).forEach(function(k){
			DEFAULTS[k] = Object.assign({}, window.defaults[k])
		})
		this.DEFAULTS = DEFAULTS
		window.p = this
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
					newNodeStyle[k] = eles.nodes().style(k) || main.DEFAULTS.nodeStyle[k]
				})
				let newNodeData = {}
				Object.keys(main.state.nodeData).forEach(function(k){
					newNodeData[k] = eles.nodes().data(k) || main.DEFAULTS.nodeData[k]
				})
				let newEdgeStyle = {}
				Object.keys(main.state.edgeStyle).forEach(function(k){
					newEdgeStyle[k] = eles.edges().style(k) || main.DEFAULTS.edgeStyle[k]
				})
				let newEdgeData = {}
				Object.keys(main.state.edgeData).forEach(function(k){
					newEdgeData[k] = eles.edges().data(k) || main.DEFAULTS.edgeData[k]
				})
				main.setState({nodeData: newNodeData, edgeData: newEdgeData, nodeStyle: newNodeStyle, edgeStyle: newEdgeStyle})
			})
		})
	}

	handleChange = (type, k, v) => {
		const elementType = type.slice(0, 4)
		const newDefaults = Object.assign({}, this.state[type])

		newDefaults[k] = v
		this.setState({[type]: newDefaults})

		if (window.defaults[type].hasOwnProperty(k)){
			window.defaults[type][k] = v
		}

		if (elementType === 'core'){
			if (k === 'background'){
				const el = document.getElementById('cyto')
				el.style['background'] = v
			}else if (k === 'grid'){
				window.cy.snapToGrid(v ? 'snapOn' : 'snapOff')
				window.cy.snapToGrid(v ? 'gridOn' : 'gridOff')
			}else if (k === 'selectionType'){
				window.cy._private.selectionType = v
			}else if (k === 'layout'){
				const layout = window.cy.layout({name: v})
				layout.run()
			}
		}else if(type.endsWith('Data')){
			const eles = this.getCurrentElements()
			if (eles)
				eles.data(k, v)
		}else{
			const eles = this.getCurrentElements()
			if (eles){
				eles.style(k, v)
				v = eles.renderedStyle(k)
				if (window.defaults[type].hasOwnProperty(k))
					window.defaults[type][k] = v
			}
			if (k === 'line-color'){
				this.handleChange('edgeStyle', 'target-arrow-color', v)
				this.handleChange('edgeStyle', 'source-arrow-color', v)

			}
		}

	}

	getCurrentElements = () => {
		if (!window.cy){
			return undefined;
		}

		let eles = undefined
		if (this.state.tab === 'node'){
			eles = window.cy.nodes(':selected')
			if (eles.length === 0)
				eles = window.cy.nodes()
		}else if (this.state.tab === 'edge'){
			eles = window.cy.edges(':selected')
			if (eles.length === 0)
				eles = window.cy.edges()
		}
		if (eles !== undefined && eles.length === 0)
			return undefined
		return eles
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
		const main = this
		const elements = this.getCurrentElements()
		let base = Object.assign({}, window.defaults[tab])
		if(elements){
			if (tab.endsWith('Data')){
				base = Object.assign(base, elements.data())
			}else if (tab.endsWith('Style')){
				Object.keys(base).forEach(function(k){
					base[k] = elements.style(k)
				})
			}
		}
		const remove = (k) => {
			if (tab.endsWith('Data')){
				delete elements.data()[k]
			}else if (tab.endsWith('Style')){
				elements.removeStyle(k)
				delete window.defaults[tab][k]
				main.setState({[tab]: window.defaults[tab]})
			}
		}

		const rows = Object.keys(base).map(function(key){
			let button = undefined

			const {name, description, input, renderedInput} = main.getRenderedRow(tab, key, main.state[tab][key], elements)
			if (name === undefined){
				return undefined
			}
			if (input !== null){
				if (main.DEFAULTS[tab].hasOwnProperty(key)){
					button = (<Button
						className="SettingsRow-button"
						onClick={() => main.handleChange(tab, key, main.DEFAULTS[tab][key])}>
						<FA name="repeat" flip='horizontal'/>
					</Button>);
				} else {
					button = (<Button
						className="SettingsRow-button"
						onClick={() => {
							remove(key)
							const info = Object.assign({}, main.state[tab])
							delete info[key]
							main.setState({[tab]: info})
						}}>
							<FA name="minus"/>
						</Button>);
				}
			}

			let nameStyle = {'cursor': 'default'}
			if (description)
				nameStyle = Object.assign(nameStyle, {cursor: 'help', textDecoration: 'underline', textDecorationStyle: 'dotted'})
			return (<tr key={key}>
				<td title={description} style={nameStyle}>{name}</td>
				{input !== null && <td>{input}</td>}
				<td colSpan={input === null ? 2 : 1}>{renderedInput}</td>
				<td>{button}</td>
			</tr>)
		})
		if (elements !== undefined && tab.endsWith('Data')){
			rows.push(<tr key="add">
					<td><input id={"add-" + tab} placeholder='New Attribute'/></td>
					<td></td>
					<td></td>
					<td><Button
						className="SettingsRow-button"
						onClick={() => {
							const data_name = window['add-' + tab].value
							elements.data(data_name, 'VALUE')
							main.setState({[tab]: main.state[tab]})
							window['add-' + tab].value = ''
						}}>
							<FA name="plus"/>
						</Button></td>
				</tr>)
		}else if (tab.endsWith('Style') && elements !== undefined && elements.style() !== undefined){
			let unused_styles = Object.keys(elements.style())
				.filter(function(n){ return !(main.state[tab].hasOwnProperty(n) || /[A-Z]/.test(n)) })
				.sort()
				.map(function(name, k){
				return <option key={k} value={name}>{name}</option>
			})
			rows.push(<tr key="add">
					<td colSpan="3">
						<select id={"add-" + tab}>
							{unused_styles}
						</select>
					</td>
					<td><Button
						className="SettingsRow-button"
						onClick={() => {
							const style_name = window['add-' + tab].value
							//elements.style(style_name, elements.style(style_name))
							window.defaults[tab][style_name] = elements.style(style_name)
							main.handleChange(tab, style_name, elements.style(style_name))
							window['add-' + tab].value = ''
						}}>
							<FA name="plus"/>
						</Button></td>
				</tr>)
		}
		return rows
	}

	getRenderedRow(tab, key, value, elements){
		const main = this;
		let renderedInput = value;
		let input = value
		let description = undefined
		let name = key
		if (elements !== undefined){
			if (tab.endsWith('Data')){
				let eles = window.cy.collection()
				if (tab.startsWith('node')){
					eles = elements.nodes()
				}else if (tab.startsWith('edge')){
					eles = elements.edges()
				}
				renderedInput = eles.data(key) || ''
				input = renderedInput
			}else if (elements.style() !== undefined){
				if (key === 'target-arrow-color' || key === 'source-arrow-color'){
					return {}
				}
				// Get rendered style if it exists
				try{
					const num = elements.numericStyle(key)
					if (typeof num === 'number'){
						renderedInput = num
					}else{
						renderedInput = elements.renderedStyle(key)
					}
				}catch(e){

				}
			}
		}
		let inputEnabled = true
		const props = SETTINGS_PROPERTIES[tab][key]
		if (props){
			if (props['name'])
				name = props['name']
			if (props['description'])
				description = props['description']
			if (props.enableInput === false)
				inputEnabled = false;
			if (props['options'])
				renderedInput = main.makeSelect(tab, key, renderedInput, props['options'])
		}

		if (inputEnabled){
			input = <input
				onChange={(v) => main.handleChange(tab, key, v.target.value)}
				type='text'
				value={input}/>

			// change component based on value type
			if (typeof renderedInput === 'number' || /^[0-9.]$/.test(renderedInput)){
				renderedInput = <input
					type='number'
					value={renderedInput}
					onChange={(v) => main.handleChange(tab, key, parseFloat(v.target.value))}/>
			}else if (isColor(renderedInput)){
				renderedInput = <Sketch color={renderedInput} onChange={(v) => main.handleChange(tab, key, v)}/>
			}else if (typeof renderedInput === 'boolean'){
				input = null;
				renderedInput = <input
					type='checkbox'
					checked={renderedInput}
					onChange={(v) => main.handleChange(tab, key, v.target.checked)}/>
			}
		}else{
			input = null
		}


		return {name, description, input, renderedInput}
	}

	getTable = () => {
		const main = this
		if (this.state.tab === 'core'){
			const actions = Object.keys(CORE_ACTIONS).map(function(key){
				return <tr key={key}>
						<td></td>
						<td colSpan="1" className="SettingsRow-action"><Button onClick={() => CORE_ACTIONS[key](main)}>{key}</Button></td>
						<td></td>
						<td></td>
					</tr>
			})
			return (<tbody>
				{this.getRows('core')}
				{actions}
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
		const rows = this.getTable()

		const tabNames = {node: 'Nodes', edge: 'Edge', core: 'Core'}

		const tabs = Object.keys(tabNames).map(function(name, k){
			return <th key={k}><Button
					className={"SettingsPanel-tab" + (main.state.tab === name ? ' active' : '')}
					onClick={() => main.setState({tab: name}) }>{tabNames[name]}</Button>
				</th>
		})
		return (
			<div className='SettingsPanel'>
				{this.state.exporting &&
					<div style={{position:'fixed', left: 0, right: 0, bottom: 0, top: 0}}>
						<ExportDialog
							onClose={() => {
								main.setState({exporting: false})
							}}/>
					</div>
				}
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
									className="SettingsRow-button"
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
