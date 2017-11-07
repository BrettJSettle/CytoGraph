import React, {Component} from 'react'
import FA from 'react-fontawesome'
import './css/Filter.css'

export default class Filter extends Component {
	constructor(props){
		super(props)
		this.state = {
			visible: false,
			filter: ""
		}
	}

	componentDidMount(){
		/*
		const el = document.getElementsByClassName("Filter")[0]
		el.onmouseover = (e) => {
			if (e.buttons === 0)
				this.setState({visible: true})
		}
		el.onmouseleave = () => {
			if (this.state.visible)
				this.setState({visible: false})
		}
		*/
	}

	filterChange = (a) => {
		this.setState({filter: a.target.value})
	}

	toggleVisible = () => {
		this.setState({visible: !this.state.visible})
		const main = this
		window.setTimeout(function() {
			if (main.state.visible){
				const el = document.getElementById('searchBar')
				el.focus()
			}
		}, 0)
	}

	render(){
		const main = this;
		const styles = {
			filterStyle: this.state.visible ? {
				border: "solid #ddd 1px",
				background: "white",
			} : {},
			iconStyle: {
				padding: this.state.visible ? '5px' : '6px'
			},
			searchBarStyle: {
				display: (this.state.visible ? 'block' : 'none')
			}
		}
		return (
			<div className="Filter" style={styles.filterStyle}>
				<input id="searchBar" type="text" onChange={(a) => main.filterChange(a)} value={this.state.filter} style={styles.searchBarStyle}/>
				<FA id='filt' name="search" onClick={this.toggleVisible} className="FilterButton" style={styles.iconStyle}/>
			</div>
		);
	}
}
