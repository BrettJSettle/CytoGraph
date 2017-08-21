import React, { Component } from 'react'
import ButtonTab from './ButtonTab.js'
import AnalysisTab from './AnalysisTab.js'
import DatabaseDialog from './DatabaseDialog.js'
import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import undoRedo from 'cytoscape-undo-redo'
import './css/CytoscapeComponent.css'
import snapToGrid from './cytoscape-snap-to-grid.js'
import clipboard from './clipboard.js'


var $ = require('jquery')

snapToGrid( cytoscape );
undoRedo(cytoscape)
edgehandles(cytoscape)
clipboard(cytoscape, $)

function firstMissingNum(source, min = 0, max = source.length){
 	if(min >= max){
		return min + 1;
	}
	let pivot = Math.floor((min + max)/2);
	// problem is in right side. Only look at right sub array
	if(source[pivot] === pivot + 1){
		return firstMissingNum(source, pivot + 1, max);
	} else {
		return firstMissingNum(source, min , pivot);
	}
}

function isTextBox(element) {
	var tagName = element.tagName.toLowerCase();
	if (tagName === 'textarea') return true;
	if (tagName !== 'input') return false;
		var type = element.getAttribute('type').toLowerCase(),
		// if any of these input types is not supported by a browser, it will behave as input type text.
		inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
	return inputTypes.indexOf(type) >= 0;
}


class CytoscapeComponent extends Component {
	
	constructor (props){
		super(props)
		let defaultProps = {
			selectionType: 'single',
			boxSelectionEnabled: 'false',
			style: {
			},
			layout: 'preset',
		
		}

		let network = Object.assign(defaultProps, props.network || {})
		
		const comp = this;
		
		network.style = cytoscape.stylesheet()
			.selector('node')
				.css({
					'background-color': (ele) =>{ return comp.fillData(ele, 'nodeColor')},
					'height': (ele) => { return comp.fillData(ele, 'nodeSize')},
					'width': (ele) => { return comp.fillData(ele, 'nodeSize')},
					'font-size': (ele) => { return comp.fillData(ele, 'fontSize')},
					'color': (ele) => {return comp.fillData(ele,'fontColor')},
					'text-halign': 'center',
					'text-valign': 'center',
					'content': 'data(label)'
				})
			.selector('edge')
				.css({
					'line-color': (ele) => { return comp.fillData(ele, 'edgeColor')},
					'content': 'data(label)',
					'font-size': (ele) => { return comp.fillData(ele, 'fontSize')},
					'color': (ele) => { return comp.fillData(ele, 'fontColor')},
					'width': (ele) => { return comp.fillData(ele, 'edgeWidth')},
					'curve-style': 'bezier',
					'target-arrow-shape': this.getTargetEdgeShape,
					'target-arrow-color': (ele) => { return comp.fillData(ele, 'edgeColor')},
					'source-arrow-shape': this.getSourceEdgeShape,
					'source-arrow-color': (ele) => { return comp.fillData(ele, 'edgeColor')},
				})
		.selector(':selected')
			.css({
				'overlay-padding': 3,
        'overlay-color': '#f00',
				'overlay-opacity': .4,
			})
		.selector('.highlighted')
			.css({
				'overlayOpacity': .4,
				'overlayColor': '#ff0',
				'overlay-padding': '3px',
			})
		

		this.state = {
			cyProps: network,
			style: {
				backgroundColor: '#ffffff',
			},
			snapToGrid: false,
		}
		this.cy = null
		this.ur = null
		this.cb = null
		this.buttonTab = null
	}

	fillData = (ele, name) => {
		const v = ele.data(name)
		if (v === undefined){
			ele.data(name, this.buttonTab.state[name])
			return this.buttonTab.state[name]
		}
		return v
	}

	getTargetEdgeShape = (ele) => {
		let typ = ele.data('edgeType') || this.buttonTab.state.edgeType
		return typ === 'undirected' ? 'none': 'triangle'
	}

	getSourceEdgeShape = (ele) => {
		let typ = ele.data('edgeType') || this.buttonTab.state.edgeType
		return typ === 'bidirectional' ? 'triangle' :  'none'
	}

	initUndoRedo(){
		var options = {
			actions: {},// actions to be added
			undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
		}
		this.ur = this.cy.undoRedo(options); // Can also be set whenever wanted.
	
		function deleteEles(eles){
			return eles.remove();
		}
		function restoreEles(eles){
			return eles.restore();
		}
		this.ur.action("deleteEles", deleteEles, restoreEles);
		this.buttonTab.ur = this.ur
	}

	initSnapToGrid(){
		this.cy.snapToGrid({
			drawGrid: false,
			snapToGrid: false,
		})
	}

	initEdgeHandles(){
		const comp = this;
		const edgehandleDefaults = {
  		handleSize: 10, // the size of the edge handle put on nodes 
  		handleHitThreshold: 6, // a threshold for hit detection that makes it easier to grab the handle 
  		handleColor: '#ff0000', // the colour of the handle and the line drawn from it 
  		handleOutlineColor: '#FFFFFF', // the colour of the handle outline 
  		handleOutlineWidth: 0, // the width of the handle outline in pixels 
  		handleNodes: 'node', // selector/filter function for whether edges can be made from a given node 
  		handlePosition: 'middle top', // position of the handle in the format of "X-AXIS Y-AXIS"
  		cxt: false, // whether cxt events trigger edgehandles (useful on touch) 
  		toggleOffOnLeave: true, //edge is toggled by leaving a node (true)
  		nodeLoopOffset: -50, // offset for edgeType: 'node' loops 
			complete: function(a, b, c) {
				c.remove()
				comp.ur.do('add', c)
			},
		}

		this.eh = this.cy.edgehandles(edgehandleDefaults)
	}

	initClipboard(){
		this.cb = this.cy.clipboard()
	}

	initActions(){
		const comp = this;
		this.cy.on('taphold', function(eve) {
			eve.stopPropagation()
			comp.cy.elements().unselect()
		})

		this.cy.on('tap', function(eve){
			if (eve.target === comp.cy){
				const pos = eve.position;
				const renderedPos = eve.renderedPosition;
				const ids = comp.cy.elements('node').map(function(node, i) { return parseInt(node.id(), 10) }).sort(function (a, b) { return a - b })
				
				const id = firstMissingNum(ids)
				const newNode = {
					data: {
						id: id,
						label: id,
						nodeColor: comp.buttonTab.state.nodeColor,
						fontColor: comp.buttonTab.state.fontColor,
						fontSize: comp.buttonTab.state.fontSize,
						nodeSize: comp.buttonTab.state.nodeSize,
					},
					position: pos,
					renderedPosition: renderedPos,
				}
				if (comp.state.snapToGrid)
					comp.cy.snapToGrid('snapOff')
				comp.ur.do("add", newNode)
				if (comp.state.snapToGrid)
					comp.cy.snapToGrid('snapOn')

			}
		});
		
		document.addEventListener("keydown", function (e) {
			if (!isTextBox(e.target)){
				document.activeElement.blur()
				if (e.ctrlKey){
					if (e.which === 67) // CTRL + C
						comp.cb.copy(comp.cy.$(":selected"));
					else if (e.which === 86) // CTRL + V
						comp.ur.do("paste");
					else if (e.which === 65) {
						if (e.shiftKey)
							comp.cy.elements().deselect()
						else
							comp.cy.elements().select();
						e.preventDefault();
					}else if (e.which === 90){
						comp.ur.undo()
					}else if (e.which === 89){
						comp.ur.redo()
					}
				} else {
					if (e.which === 46){
						comp.ur.do("remove", comp.cy.elements(":selected"))
					}
				}
			}
		});

		this.cy.on('add', function(eve){
			if (eve.target.hasClass('edgehandles-ghost-node')){
				return
			}
			comp.cy.batch(function(){
				comp.cy.elements(":selected").unselect()
				eve.target.select()
			})
		})

		this.cy.on('select', function(eve){
			comp.buttonTab.update()
			document.activeElement.blur()
		})
	}

	init(){
		this.initUndoRedo()
		this.initEdgeHandles()
		this.initClipboard()
		this.initActions()
		this.initSnapToGrid() 
	}

	update(name, val){
		if (name === 'backgroundColor'){
			let newStyle = Object.assign({}, this.state.style)
			newStyle[name] = val
			this.setState({style: newStyle})
		}else if (name === 'grid'){
			const opp = !this.state.snapToGrid
			if (opp){
				this.cy.snapToGrid('snapOn')
				this.cy.snapToGrid('gridOn')
			}else {
				this.cy.snapToGrid('snapOff')
				this.cy.snapToGrid('gridOff')
			}
			this.setState({snapToGrid: opp})
		}
	}

	componentDidMount(){
		this.cy = cytoscape({
  		container: document.getElementById('cy'),
	    ...this.state.cyProps,
		});
		
		this.init()
		this.buttonTab.cyto = this
		this.propagateNamespace()
	}

	propagateNamespace(){
		window.cy = this.cy;
		window.log = function(s){
			let el = document.getElementsByClassName('outputArea')[0]
			let logs = el.value
			if (typeof s === "object")
				s = JSON.stringify(s)
			logs += "\n" + s
			el.value = logs.substr(-1000)
		}
		window.g =window.G = function(a, b) {
			if (a === undefined){
				return window.cy.elements()
			}
			a = String(a)
			if (b !== undefined){
				const from = window.g(a)
				const to = window.g(b)
				return window.cy.elements().edgesWith(to, from)
			}
			if (window.cy.hasElementWithId(a))
				return window.cy.getElementById(a)

			return window.cy.elements(a)
		}

		window.highlight = function(e){
			e.toggleClass('highlighted')
		}
	}

	loadScript(src) {
		let scr = document.getElementById("scriptTag")
		if (scr)
			scr.remove()
  	
		var tag = document.createElement('script');
		tag.id = "scriptTag"
		tag.async = false;
		tag.append(src)
		document.getElementsByTagName('body')[0].appendChild(tag);
	}

	render(){
		const comp = this;
		return (
			<div className="CytoscapeComponent">
      	<ButtonTab
					ref={(tab) => {comp.buttonTab = tab}}
				/>
				<AnalysisTab onRun={(sc)=> comp.loadScript(sc) }/>
				<DatabaseDialog />
				<div id="cy" style={this.state.style}>
				</div>
			</div>
		);
	}
}

export default CytoscapeComponent;
