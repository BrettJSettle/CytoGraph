import React, {Component} from 'react'
import ModalDialog from './ModalDialog'

export default class GraphSpaceDialog extends Component {
	constructor(props){
		super(props)
		this.state = {
			mode: props.mode,
			username: '',
			password: '',
			logged_in: false,
			browser: undefined,
		}
	}

	get_graph_list(username, password){
		const main = this
		const data = {
			url: 'http://www.graphspace.org/api/v1/graphs/?is_public=1&limit=50',
			method: 'GET',
			headers: JSON.stringify({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa(username + ':' + password)
			})
		}
		fetch('http://thesettleproject.com/cgi-bin/bcurl.py', {
			method: 'POST',
			body: JSON.stringify(data),
		})
		.then(data => data.json())
		.then(json => {
			if (json['errors'].length > 0){
				json['error_message'] = json['errors']
				return json
			}
			return JSON.parse(json['data'])
		})
		.then((json) => {
			if (json['error_message']){
				alert(json['error_message'])
			}else{
				const elements = json['graphs'].map(function(a, k){
					return <li key={k}>{a['name']}</li>
				})

				main.setState({username: username, password: password, mode: 'import', browser: <div className="graphspace-list-container">
					<ul className="graphspace-list">
						{elements}
					</ul>
				</div>, logged_in: true})
			}
		})
	}

	modeChanged = (m) => {
		this.setState({mode: m, browser: m === 'export' ? this.get_export_form() : this.get_graph_list(this.state.username, this.state.password)})
	}


	get_export_form(){
		return undefined
	}

	toggle_login = () => {
		if (!this.state.logged_in){
			const password = window.graphspacePassword.value
			const username = window.graphspaceUsername.value
			this.get_graph_list(username, password)
		}else{
			this.setState({logged_in:false, browser: undefined, username: '', password: ''})
		}
	}

	render(){
		const main = this
		return (<ModalDialog
		containerClassName="graphspace-export-container"
		className="graphspace-export-dialog"
		closeOnOuterClick={true}
	  onClose={this.props.onClose}
		show={true}>
			<div id="graphspace-form">
				<h4><a href="http://graphspace.org">GraphSpace</a></h4>
				<div className="graphspace-login">
					<h5>Login</h5>
					{this.state.logged_in && <p>Hello {this.state.username}</p>}
					{!this.state.logged_in && <input id='graphspaceUsername' placeholder="Username" />}<br />
					{!this.state.logged_in && <input id='graphspacePassword' type="password" placeholder="password"/>}
					<button className='btn' onClick={() => this.toggle_login()}>{this.state.logged_in ? "Logout" : "Login"}</button>
				</div>
				{this.state.logged_in ?
				<div className="graphspace-browser">
					<div className="graphspace-toggle">
						<button
							className={this.state.mode === 'import' ? 'btn active' : 'btn'}
							onClick={() => main.modeChanged('import')}>Import</button>
						<button
							className={this.state.mode === 'export' ? 'btn active' : 'btn'}
							onClick={() => main.modeChanged('export')}>Export</button>
					</div>
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
const exportNetwork = (username, password) => {
	const email = "email@test"
	const name = "NAME TEST"
	const now = new Date().toISOString()
	const data = {
		"style_json": {
			"style": window.cy.style(),
			"target_cytoscapejs_version": "~2.1",
			"generated_by": "cytograph-1.0.0",
			"format_version": "1.0"
		},
		"name": name,
		"tags": [
		{
			"updated_at": now,
			"created_at": now,
		}
		],
		"updated_at": now,
		"is_public": 1,
		"created_at": now,
		"owner_email": email,
		"default_layout_id": 0,
		"id": 21384,
		"graph_json": window.cy.json()
	}
	fetch('http://www.graphspace.org/api/v1/graphs/', {
		'method': 'post',
		'headers': {
			"Accept" : "application/json",
			"Content-Type": "application/json",
			"Authorization": "Basic " + btoa(username + ":" + password),
		},
		body: data
	})
	.then(resp => {
		if (resp.ok){
			return resp.json()
		}
		console.log(resp.text())
		throw new Error("Unsuccessful")
	})
	.then(json => {
		console.log("SUCCESS")
		console.log(json)
	})
	.catch(e => {
		console.log("ERROR")
		console.log(e)
	})
}

