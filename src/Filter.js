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
		const main = this
		window.addEventListener('load', function(){
			window.searchBar.addEventListener('blur', function(){
				main.setState({visible: false})
			})
		})
	}

	applyFilter(f){
		window.cy.elements().unselect()
		try{
			setTimeout(function(){
				if (f)
					window.cy.$(f).select()
			}, 100)
		}catch(e){

		}
		this.setState({filter: f})
	}

	filterChange = (a) => {
		this.applyFilter(a.target.value)
	}

	toggleVisible = () => {
		this.setState({visible: !this.state.visible})
		const main = this
		window.setTimeout(function() {
			if (main.state.visible){
				const el = document.getElementById('searchBar')
				el.focus()
				main.applyFilter(main.state.filter)
			}
		}, 0)
	}

	render(){
		const main = this;
		const styles = {
			filterStyle: this.state.visible ? {
				background: "white",
				overflow: 'hidden'
			} : {},
			iconStyle: {
				padding: '7px',
				fontSize: '2rem',
				background: this.state.visible ? 'gray': 'transparent',
				color: this.state.visible ? 'white': 'gray'
			},
			searchBarStyle: {
				display: (this.state.visible ? 'block' : 'none'),
				fontSize: '2rem',
				height:'100%',
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
