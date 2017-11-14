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

window.settings = {
	mode: 'Create',
}

window.defaults = {
	core: {
		background: '#ffffff',
		grid: false,
	},
	nodeStyle: {
		'background-color': '#999999',
		'color': '#000000',
		'width': 30,
		'height': 30,
		'shape': 'ellipse',
		'text-opacity': 1,
		'font-size': 12,
	},
	edgeStyle: {
		'line-color': '#999999',
		'color': '#000000',
		'target-arrow-color': '#999999',
		'source-arrow-color': '#999999',
		'width': 5,
		'text-opacity': 1,
		'font-size': 12,
		'line-style': 'solid',
		'arrow-scale': 1,
	},
	nodeData: {
	},
	edgeData: {
		'type': 'directed',
	},
}


window.addEventListener("load", function() {
	var cy = window.cy = cytoscape({
		container: document.getElementById('cyto'),
		ready: function() {},
		layout: {
			name: 'preset',
		},
		style: [{
			selector: ':selected',
			css: {
				'overlay-padding': 3,
				'overlay-color': '#f00',
				'overlay-opacity': .3,
			}
		},{
			selector: '.highlighted',
			css: {
				'overlayOpacity': .3,
				'overlayColor': '#ff0',
				'overlay-padding': '3px',
			},
		}, {
			selector: 'node',
			css: {
				'content': 'data(label)',
				'text-halign': 'center',
				'text-valign': 'center',
			}
		}, {
			selector: 'edge',
			css: {
				'curve-style': 'bezier',
				'target-arrow-shape': function(node){ return node.data('type') === 'undirected' ? 'none': 'triangle' },
				'source-arrow-shape': function(node){ return node.data('type') === 'bidirectional' ? 'triangle': 'none' }
			}
		},
		// some style for the ext
		{
			selector: '.edgehandles-hover',
			css: {
				//'background-color': 'red'
			}
		},
		{
			selector: '.edgehandles-source',
			css: {
				'border-width': 2,
				'border-color': 'red',
				'border-opacity': .3
			}
		},
		{
			selector: '.edgehandles-target',
			css: {
				'border-width': 2,
				'border-color': 'red',
				'border-opacity': .3
			}
		},
		{
			selector: '.edgehandles-preview, .edgehandles-ghost-edge',
			css: {
				'line-color': 'red',
				'target-arrow-color': 'red',
				'source-arrow-color': 'red'
			}
		}],
		elements: {
			nodes: [],
			edges: []
		}
	});


	var options = {
		actions: {},// actions to be added
		undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
	}
	const undoRedo = window.undoRedo = cy.undoRedo(options); // Can also be set whenever wanted.

	function deleteEles(eles){
		return eles.remove();
	}
	function restoreEles(eles){
		return eles.restore();
	}
	undoRedo.action("deleteEles", deleteEles, restoreEles);

	cy.snapToGrid({
		drawGrid: false,
		snapToGrid: false,
	})

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
			c.data(window.defaults.edgeData)
			undoRedo.do('add', c)
		},
		loopAllowed: function( node ) {
    	return true;
  	},
	}

	const edgeHandles = window.edgeHandles = cy.edgehandles(edgehandleDefaults)

	const clipboard = window.clipboard = cy.clipboard()

	cy.on('taphold', function(eve) {
		eve.stopPropagation()
		cy.elements().unselect()
	})

	cy.on('tap', function(eve){

		if (window.settings['mode'] === 'Create' && eve.target === cy){
			const pos = eve.position;
			const renderedPos = eve.renderedPosition;
			const ids = cy.elements('node').map(function(node, i) { return parseInt(node.id(), 10) }).sort(function (a, b) { return a - b })

			const id = firstMissingNum(ids)
			const newNode = {
				data: {
					id: id,
					label: id,
				},
				style: window.defaults.nodeStyle,
				position: pos,
				renderedPosition: renderedPos,
			}
			undoRedo.do("add", newNode)
		}
	});

	cy.on("select", function(ev){
		if (window.settings.mode === 'Remove'){
			window.undoRedo.do("remove", ev.target)
		}
	})


	document.addEventListener("keydown", function (e) {
		if (document.activeElement.tagName !== 'body')
			return
		document.activeElement.blur()
		if (e.ctrlKey || e.metaKey){
			if (e.which === 67) // CTRL + C
				clipboard.copy(cy.$(":selected"));
			else if (e.which === 86) // CTRL + V
				undoRedo.do("paste");
			else if (e.which === 65) {
				if (e.shiftKey)
					cy.elements().deselect()
				else
					cy.elements().select();
				e.preventDefault();
			}else if (e.which === 90){
				undoRedo.undo()
			}else if (e.which === 89){
				undoRedo.redo()
			}
		} else {
			if (e.which === 46 || e.key === 'Backspace'){
				undoRedo.do("remove", cy.elements(":selected"))
			}
		}
		e.stopPropagation()
	});

	cy.on('add', function(eve){
		if (eve.target.group() === 'edges'){
			eve.target.style(window.defaults.edgeStyle)
		}
		if (eve.target.hasClass('edgehandles-ghost-node')){
			return
		}
		cy.batch(function(){
			cy.elements(":selected").unselect()
			eve.target.select()
		})
	})

});
