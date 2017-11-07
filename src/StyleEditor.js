import React, {Component} from 'react'
import ReactDataGrid from 'react-data-grid';

export default class StyleEditor extends Component {
	constructor(props){
		super(props)
		this.state = {
			columns: [],
      elements: []
		}
    this.table = null
	}

	componentDidMount(){
    const main = this;
		window.addEventListener("load", function() {
      window.cy.on("select unselect", function(el){
        const cls = el.target._private.classes._obj
        if ('edgehandles-ghost-node' in cls || 'edgehandles-ghost-edge' in cls || 'edgehandles-preview' in cls)
          return
        
      })
    });
	}

	rowGetter = (i) => {
		if (i >= 0 && i < this.state.elements.length){
	    return this.state.elements[i].data()
  	}
  }

  getColumns = () => {
    const columns = {}
    for (let i = 0; i < this.state.elements.length; i++) {
      const el = this.state.elements[i]
      Object.keys(el.data()).forEach(function(k){
        columns[k] = {key: k, name: k, editable: true, resizable: true}
      })
    }
    return columns
  }

  render() {
  	const columns = this.getColumns()
    return  (
      <ReactDataGrid
      	ref={(a) => this.table = a }
        columns={Object.values(columns)}
        rowGetter={this.rowGetter}
        rowsCount={this.state.elements.length}
        />);
  }
}
