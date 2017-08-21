import React, { Component } from 'react'
import FA from 'react-fontawesome'
import './css/ButtonTab.css'
import ColorButton from './ColorButton.js'

export default class ButtonTab extends Component {
	constructor(props){
		super(props)
		this.ur = null
		this.cyto = null
		this.state = {
			fontSize: 12,
			fontColor: "#000000",
			label: "",
			edgeType: 'undirected',
			nodeColor: "#aaaaaa",
			nodeSize: 30,
			edgeWidth: 3,
			edgeColor: "#aaaaaa",
			backgroundColor: "#ffffff",
			grid: false,
		}
	}

	update(){
		const eles = this.cyto.cy.elements(':selected')
		
		if (eles.length === 0)
			return
		
		const comp = this
		let props = {}
		
		Object.keys(comp.state).forEach(function(name) {
			if (name === 'backgroundColor' || name === 'grid')
				return

			const els = name.startsWith('edge') ? eles.edges() : (name.startsWith('node') ? eles.nodes() : eles);
			var sts = els.map((el) => {
				if (el.data(name) === undefined)
					return comp.state[name]
				return el.data(name)
			})
			const vals = [...new Set(sts)];
				
			if (vals.length === 1 && comp.state[name] !== vals[0])
				props[name] = vals[0]
		})
		
		this.setState({
			...props})
		
	}

	componentDidMount(){
		var acc = document.getElementsByClassName("accordion");
		var i;
		const comp = this;

		var onPress = function() {
				for (i = 0; i < acc.length; i++) {
					var panel = acc[i].nextElementSibling;
					if (this === acc[i]){
						this.classList.toggle("active");
    				panel.classList.toggle("open-accordion")
      			if (panel.style.maxHeight)
      				panel.style.maxHeight = null;
						else
							panel.style.maxHeight = panel.scrollHeight + "px";
					}else {
						acc[i].classList.remove("active");
    				panel.classList.remove("open-accordion")
      			panel.style.maxHeight = null;
					}
				}
				comp.refocus()
  		}
		for (i = 0; i < acc.length; i++) {
  		acc[i].onclick = onPress
		}

		const el = document.getElementById('gridToggle')
		el.change = function() {
			const gridOff = el.parentElement.classList.contains('off')
			comp.changed('core', 'grid', gridOff)
		}
	}

	changed(key, name, val){
		const eles = this.cyto.cy.elements(':selected')
		this.setState({[name]: val})
		
		if (key !== 'core' && (eles === null || eles.length === 0)){
			return
		}
		
		if (key==='node'){
			eles.nodes().data(name, val)
		}else if (key === 'edge'){
			eles.edges().data(name, val)
			
		} else if (key === 'core'){
			this.cyto.update(name, val)
		}else{
			eles.data(name, val)
		}
			
	}

	refocus(){
		document.activeElement.blur()
	}

	render(){
		let comp = this;
		let nodeStyle = {
			color: this.state.nodeColor,
		}
		let edgeStyle = {
			color: this.state.edgeColor,
		}
		let labelStyle = {
			color: this.state.fontColor
		}
		
		let arrowNames = {directed: 'long-arrow-right', undirected: 'minus', bidirectional: 'arrows-h'}

		let labelPanel = (
					<div className="panel" id="labelPanel">
						<ColorButton
							color={this.state.fontColor}
							onChange={(color) => comp.changed("label", "fontColor", color)}/>
						<input
							type="range"
							value={this.state.fontSize}
							step={1}
							min={1}
							max={100}
							onClick={ (eve) => comp.changed('label', 'fontSize', parseFloat(eve.target.value, 10))}
							onChange={(eve) => {
								comp.changed('label', 'fontSize', parseFloat(eve.target.value, 10))
							}}
						/>
						<input
							type="text"
							value={this.state.label}
							onChange={function(eve){
								comp.changed('label', 'label', eve.target.value)
								}
							}/>
					</div>)

		let nodePanel = (
					<div className="panel">
						<ColorButton
							color={this.state.nodeColor}
							onChange={(color) => { comp.changed('node', 'nodeColor', color)}}/>
						<input type="range"
							value={this.state.nodeSize}
							min={1}
							max={100}
							step={1}	
							onClick={(eve) => comp.changed('node', 'nodeSize', parseFloat(eve.target.value, 10))}
							onChange={(eve) => {
								const num = parseFloat(eve.target.value, 10)
								comp.changed('node', 'nodeSize', num)
							}}/>
					</div>)

		let edgePanel = (
					<div className="panel">
						<ColorButton
							color={this.state.edgeColor}
							onChange={(color) => { comp.changed('edge', 'edgeColor', color) }}/>
						<input type="range"
							value={this.state.edgeWidth}
							min={1}
							max={100}
							step={1}
							onClick={ (eve) => comp.changed('edge', 'edgeWidth', parseFloat(eve.target.value, 10))}
							onChange={(eve) => { comp.changed('edge', 'edgeWidth', parseFloat(eve.target.value, 10)) }}/>
						<div className="btn-group">
						  <button type="button"
								className={"btn btn-primary" + (this.state.edgeType === 'undirected' ? ' selected' : '')}
								onClick={() => comp.changed('edge', 'edgeType', 'undirected')}>
									<FA name="minus" size="2x"/>
							</button>
							<button type="button"
								className={"btn btn-primary" + (this.state.edgeType === 'directed' ? ' selected' : '')}
								onClick={() => comp.changed('edge', 'edgeType', 'directed')}>
									<FA name="long-arrow-right" size="2x"/>
							</button>
							<button type="button"
								className={"btn btn-primary" + (this.state.edgeType === 'bidirectional' ? ' selected' : '')}
								onClick={() => comp.changed('edge', 'edgeType', 'bidirectional')}>
									<FA name="arrows-h" size="2x"/>
							</button>
						</div>
					</div>)

		let settingsPanel = (
					<div className="panel">

						<ColorButton
							color={this.cyto === null ? '#ffffff' : this.cyto.state.style['backgroundColor']}
							onChange={(color) => { comp.changed('core', 'backgroundColor', color)}}/>
						<input type="checkbox" id="gridToggle" value={this.state.grid} data-toggle="toggle" data-on="Grid Snap On" data-off="Grid Snap Off"/>

					</div>)

		return (
			<div className="accordion-menu">
				<button className="LabelEdit accordion"
					style={labelStyle}>Aa</button>
						{labelPanel}
				<button className="accordion nodeButton">
					<FA name="circle" size="2x" style={nodeStyle}/>
				</button>
					{nodePanel}
				<button className="accordion edgeButton">
					<FA name={arrowNames[this.state.edgeType]} size="2x" style={edgeStyle}/>
				</button>
					{edgePanel}
				<button className="accordion">
					<FA name="sliders" size="2x" />
				</button>
					{settingsPanel}
				<button
					className="undo"><FA name="undo" size="2x"
					onClick={() => { 
						comp.ur.undo();
						comp.refocus()}}/></button>
				<button
					className="redo"><FA name="repeat" size="2x"
					onClick={() => {
						comp.ur.redo();
						comp.refocus(); }}/></button>
				<button
					className="trash"><FA name="trash" size="2x"
					onClick={() => {
						comp.ur.do('remove', comp.cy.elements(':selected'));
						comp.refocus() }}/></button>
		</div>
		);
	}
}

