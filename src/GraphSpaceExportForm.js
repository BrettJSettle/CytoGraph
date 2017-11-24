import React, {Component} from 'react'

export default class GraphSpaceExportForm extends Component {
	constructor(props){
		super(props)
		this.state = {
			attributes: {},
		}
	}

	exportNetwork = (formData) => {
		let formObj = {}
		formData.forEach(v => {
			formObj[v['name']] = v['value']
		})
		const main = this
		const email = this.props.email
		const password = this.props.password
		const name = formObj['name']
		const now = new Date().toISOString()
		let tags = []
		if (formObj['tags'])
			tags = formObj['tags'].split(',')
		const graph_data = {
			"style_json": {
				"style": window.cy.style().json(),
				"target_cytoscapejs_version": "~2.1",
				"generated_by": "cytograph-1.0.0",
				"format_version": "1.0"
			},
			"name": name,
			"tags": tags,
			"updated_at": now,
			"is_public": 1,
			"created_at": now,
			"owner_email": email,
			"default_layout_id": 0,
			"id": parseInt(Math.random() * 10000),
			"graph_json": window.cy.json()
		}
		const data = {url: 'http://www.graphspace.org/api/v1/graphs/',
			method: 'POST',
			headers: JSON.stringify({
				"Accept" : "application/json",
				"Content-Type": "application/json",
				"Authorization": "Basic " + btoa(email + ":" + password),
			}),
			body: JSON.stringify(graph_data)
		}
		console.log(data)
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
				alert("Network successfully exported to Graphspace with id " + json['id'])
			}
		})
		.catch(e => {
			alert("Failed to export to GraphSpace.")
			console.log(e)
		})
	}

	render(){
		const main = this;
		return <form id='graphspaceExport' className="graphspace-export" onSubmit={(e) => e.preventDefault() }>
			<div className="graphspace-export-info">
				<p>Tags</p>
				<textarea name="tags" placeholder="comma-delimited tags for the network">
				</textarea>
			</div>
			<div className="graphspace-list-buttons">
				<div className='graphspace-export'>
					<input name="name" placeholder="Name" />
					<button className='btn-default' onClick={() => main.exportNetwork(window.$('#graphspaceExport').serializeArray())}>Export</button>
				</div>
			</div>
		</form>
	}
}
