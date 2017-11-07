import React, {Component} from 'react'
import './css/Container.css'
import DockPanel from './DockPanel.js'
import Toolbar from './Toolbar.js'
import Filter from'./Filter.js'
export default class Container extends Component {

	render(){
		return (
			<div className="Container">
				<Filter />
				<Toolbar />
				<DockPanel />
			</div>
		);
	}
}
