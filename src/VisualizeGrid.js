import React, {Component} from 'react'
import {Grid, Row, Col, ToggleButton, ButtonToolbar, ToggleButtonGroup } from 'react-bootstrap'
import {CheckboxThumbnail, SelectThumbnail, RangeThumbnail, ColorThumbnail, TextThumbnail} from './Thumbnails.js'
import './css/DataGrid.css'



export default class Table extends Component {
	constructor(props){
		super(props)
		this.state = {
      mode: 'nodes',
      type: 'data',
			selectedNodes: [],
			selectedEdges: [],
		}
	}

	selectionChanged = (el) => {
		/*const cls = el.target._private.classes._obj
		if ('edgehandles-ghost-node' in cls || 'edgehandles-ghost-edge' in cls || 'edgehandles-preview' in cls){
			return
		}*/
		let selectedNodes = window.cy.nodes(':selected')
		if (selectedNodes.length === 0)
			selectedNodes = window.cy.nodes()
		let selectedEdges = window.cy.edges(':selected')
		if (selectedEdges.length === 0)
			selectedEdges = window.cy.edges()
		console.log(selectedNodes.toArray(), selectedEdges.toArray())
		this.setState({ selectedNodes, selectedEdges })
	}

	componentDidMount() {
		const main = this
		window.addEventListener("load", function() {
			window.cy.on('select', main.selectionChanged);
			main.setState({selectedEdges: window.cy.collection(), selectedNodes: window.cy.collection()})
		});
	}

	updateNodeStyle = (data) => {
		const main = this
		window.cy.batch(function(){
			Object.keys(data).forEach(function(k){
				main.state.selectedNodes.style(k, data[k])
			});
		});
		Object.assign(window.defaults.nodeStyle, data)
	}

	updateEdgeStyle = (data) => {
		const main = this
		window.cy.batch(function(){
			Object.keys(data).forEach(function(k){
				main.state.selectedEdges.style(k, data[k])
			});
		});
		Object.assign(window.defaults.edgeStyle, data)
	}

	updateEdgeData = (data) => {
		const main = this
		window.cy.batch(function(){
			Object.keys(data).forEach(function(k){
				main.state.selectedEdges.data(k, data[k])
			});
		});
		Object.assign(window.defaults.edgeData, data)
	}

	getNodeStyleComponents = () => {
		const shapes = ['ellipse', 'triangle', 'rectangle', 'roundrectangle', 'bottomroundrectangle', 'cutrectangle',
			'barrel', 'rhomboid', 'diamond', 'pentagon', 'concavehexgon', 'heptagon', 'octagon', 'star', 'tag', 'vee']
		const main = this;
		return [
			<ColorThumbnail title="Color" value={window.defaults.nodeStyle['background-color']} onChange={(v) => { main.updateNodeStyle({'background-color': v})} } />,
			<ColorThumbnail title="Text Color" value={window.defaults.nodeStyle['color']} onChange={(v) => {main.updateNodeStyle({'color': v})} } />,
			<RangeThumbnail title="Width" min={1} max={100} value={window.defaults.nodeStyle['width']} onChange={(v) => {main.updateNodeStyle({'width': v})} } />,
			<RangeThumbnail title="Height" min={1} max={100} value={window.defaults.nodeStyle['height']} onChange={(v) => {main.updateNodeStyle({'height': v})} } />,
			<SelectThumbnail title="Shape" options={shapes} value={window.defaults.nodeStyle['shape']} onChange={(v) => {main.updateNodeStyle({'shape': v})} } />,
			<CheckboxThumbnail title="Show Label" value={window.defaults.nodeStyle['text-opacity']===1} onChange={(v) => {main.updateNodeStyle({'text-opacity': v ? 1 : 0}) } } />,
			<RangeThumbnail title="Font Size" min={5} max={100} value={window.defaults.nodeStyle['font-size']} onChange={(v) => {main.updateNodeStyle({'font-size': v})} }/>,
		]
	}

	getEdgeStyleComponents = () => {

		const lineStyles = ['solid', 'dotted', 'dashed']
		const main = this;
		return [
			<SelectThumbnail title="Directed" options={['directed', 'undirected', 'bidirectional']} value={window.defaults.edgeData['directed']} onChange={(v) => {main.updateEdgeData({'directional': v})} } />,
			<ColorThumbnail title="Color" value={window.defaults.edgeStyle['line-color']} onChange={function(v) {
				main.updateEdgeStyle({'line-color': v, 'source-arrow-color': v, 'target-arrow-color': v})
			} } />,
			<ColorThumbnail title="Text Color" value={window.defaults.edgeStyle['color']} onChange={(v) => {main.updateEdgeStyle({'color': v})} } />,
			<RangeThumbnail title="Width" min={1} max={100} value={window.defaults.edgeStyle['width']} onChange={(v) => {main.updateEdgeStyle({'width': v})} } />,
			<RangeThumbnail title="Arrow Scale" min={.1} step={.1} max={3} value={window.defaults.edgeStyle['arrow-scale']} onChange={(v) => {main.updateEdgeStyle({'arrow-scale': v})} } />,
			<SelectThumbnail title="Line Style" options={lineStyles} value={window.defaults.edgeStyle['line-style']} onChange={(v) => {main.updateEdgeStyle({'line-style': v})} } />,
			<RangeThumbnail title="Font Size" min={5} max={100} value={window.defaults.edgeStyle['font-size']} onChange={(v) => {main.updateEdgeStyle({'font-size': v})} }/>,
		]
	}

  render() {
		const main = this;
		const buttons = (
			<ButtonToolbar className="TableButtons TabToolbar">
				<ToggleButtonGroup type="radio" name='mode' defaultValue='nodes' onChange={(v) => {main.setState({mode: v})} } vertical>
					<ToggleButton value='nodes'>Nodes</ToggleButton>
					<ToggleButton value='edges'>Edges</ToggleButton>
					<ToggleButton value='networks'>Network</ToggleButton>
				</ToggleButtonGroup>
				<ToggleButtonGroup type="radio" name='type' defaultValue='data' onChange={(v) => {main.setState({type: v})} } vertical>
					<ToggleButton value='data'>Data</ToggleButton>
					<ToggleButton value='style'>Style</ToggleButton>
				</ToggleButtonGroup>
			</ButtonToolbar>
		)

		const nodeStyle = this.getNodeStyleComponents().map(function(comp, k){
			return (<Col xs={3} md={2} key={k}>
				{comp}
			</Col>);
		});
		const edgeStyle = this.getEdgeStyleComponents().map(function(comp, k){
			return (<Col xs={3} md={2} key={k}>
				{comp}
			</Col>);
		});

		const setElementData = (el, data) => {
			try {
				const d = JSON.parse(data)
				el.data(d)
			}catch(e){

			}
		}
		const getDataThumbnail = (el, k) => {
			return (<Col xs={3} md={2} key={k}>
					<TextThumbnail
						title={String(el.data('label'))}
						value={JSON.stringify(el.data())}
						onChange={(v) => { setElementData(el, v)}}/>
				</Col>);
		}

		const nodeData = this.state.selectedNodes.map(function(el, k){
			return getDataThumbnail(el, k);
		});

		const edgeData = this.state.selectedEdges.map(function(el, k){
			return getDataThumbnail(el, k);
		});

		const rowStyle = (mode, type) => {
			return {display: this.state.mode === mode && this.state.type === type ? 'block' : 'none'}
		}

		return  (
      <div className="Table">
				{buttons}
				<div className="TableContainer" style={{width: '100%', height: '100%'}}>
					<Grid>
						<Row style={rowStyle('nodes', 'style')}>
							{nodeStyle}
						</Row>
						<Row style={rowStyle('edges', 'style')}>
							{edgeStyle}
						</Row>
						<Row style={rowStyle('nodes', 'data')}>
							{nodeData}
						</Row>
						<Row style={rowStyle('edges', 'data')}>
							{edgeData}
						</Row>
					</Grid>
				</div>
			</div>);
  }
}
