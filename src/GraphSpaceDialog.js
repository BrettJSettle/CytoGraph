import React, {Component} from 'react'
import ModalDialog from './ModalDialog'
import GraphSpaceBrowser from './GraphSpaceBrowser.js'
import GraphSpaceExportForm from './GraphSpaceExportForm.js'
import FA from 'react-fontawesome'
import {Button} from 'react-bootstrap'

export default class GraphSpaceDialog extends Component {
	constructor(props){
		super(props)
		this.state = {
			mode: props.mode,
			email: '',
			password: '',
			logged_in: false,
			browser: undefined,
		}
	}

	get_graph_list(email, password){
		this.setState({email: email,
			password: password,
			mode: 'import',
			browser: <GraphSpaceBrowser
				email={email}
				password={password}/>,
			logged_in: true})
	}

	modeChanged = (m) => {
		if ( m === 'export'){
			this.get_export_form()
		}else{
			this.get_graph_list(this.state.email, this.state.password)
		}
	}


	get_export_form = () => {
		this.setState({mode: 'export', browser: <GraphSpaceExportForm
			email={this.state.email}
			password={this.state.password}/>
		})
	}

	toggle_login = () => {
		if (!this.state.logged_in){
			const password = window.graphspacePassword.value
			const email = window.graphspaceEmail.value
			this.get_graph_list(email, password)
		}else{
			this.setState({logged_in:false, browser: undefined, email: '', password: ''})
		}
	}

	render(){
		const main = this
		return (<ModalDialog
		containerClassName="graphspace-export-container"
		containerStyle={{minWidth: '400px', width: '60%'}}
		className="graphspace-export-dialog"
		closeOnOuterClick={true}
	  onClose={this.props.onClose}
		show={true}>
			<button className='btn-xs btn-default pull-right' id="graphspace-close" onClick={this.props.onClose}><FA name="close"/></button>
			<div id="graphspace-form">
				<h4><a href="http://graphspace.org">GraphSpace</a></h4>
				<form className="graphspace-login" action="return false;" onSubmit={(e) => e.preventDefault() } style={{display: this.state.logged_in ? 'flex': 'grid'}}>
					{this.state.logged_in && <p>Hello {this.state.email}</p>}
					{!this.state.logged_in && <input id='graphspaceEmail' placeholder="Email" />}
					{!this.state.logged_in && <input id='graphspacePassword' type="password" placeholder="password"/>}
					<button className='btn' onClick={() => this.toggle_login()}>{this.state.logged_in ? "Logout" : "Login"}</button>
				</form>
				{this.state.logged_in ?
				<div className="graphspace-browser">
					<ul className="nav nav-pills graphspace-toggle">
						<li className={this.state.mode === 'import' ? 'nav-item active' : "nav-item"}>
							<a onClick={() => main.modeChanged('import')}>Import</a>
						</li>
						<li className={this.state.mode === 'export' ? 'nav-item active' : "nav-item"}>
							<a onClick={() => main.modeChanged('export')}>Export</a>
						</li>
					</ul>
					{this.state.browser}
				</div>
				:
				<div className="graphspace-browser">
					Log in to access GraphSpace. <a href="http://graphspace.org/">Visit Graphspace</a> to create an account
				</div>
				}
			</div>
		</ModalDialog>
		)
	}

}
