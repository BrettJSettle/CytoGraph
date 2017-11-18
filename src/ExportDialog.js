import React from 'react'
import ModalDialog from './ModalDialog.js'
import './css/ExportDialog.css'

const EXPORT_OPTIONS = ['jpg', 'png', 'json']

export default class ExportDialog extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			method: 'jpg',
		}
	}

	getData = (m) => {
		let data = ''
		if (m === 'jpg'){
			data = window.cy.jpg()
		}else if (m === 'png'){
			data = window.cy.png()
		}else if (m === 'json'){
			data = JSON.stringify(window.cy.json())
		}
		return data
	}

	export = () => {
		var data = this.getData(this.state.method)
		if (this.state.method === 'json'){
			data = "data:text/json;charset=utf-8," + encodeURIComponent(data);
		}
		var elem = document.createElement('a');
		elem.setAttribute("href",data);
		elem.setAttribute("download", "network." + this.state.method);
		elem.click();

		this.props.onClose()
	}

	render(){
		const main = this
		const options = EXPORT_OPTIONS.map(function(k){
			return <option value={k} key={k}>{k}</option>
		})
		const data = this.getData(this.state.method)
		return <ModalDialog
				show={true}
				containerStyle={{width: '50%', minWidth: '400px'}}
				style={{background: 'rgba(0, 0, 0, .25)', position: 'absolute', left: 0, right: 0, bottom: 0, top: 0}}
				closeOnOuterClick={true}
				containerClassName='ExportDialog'
				onClose={() => (this.props.onClose())}
			>
			<h2>Export Network</h2>
				<p>Your network can be exported as an image, CyJS file, and many more to come.</p>
			<div className="ExportDialog-buttons">
				<textarea className="ExportDialog-data" value={data} disabled/>
				<select id="method" onChange={(v) => main.setState({method: v.target.value})} value={this.state.method}>
					{options}
				</select>
				<button onClick={this.export}>Export</button>
			</div>
		</ModalDialog>
	}
}
