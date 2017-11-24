import React, {Component} from 'react'

const COUNT = 50

export default class GraphSpaceBrowser extends Component {
	constructor(props){
		super(props)
		this.state = {
			networks: [],
			page: 0
		}
	}

	componentDidMount(){
		this.get_graph_list(0)
	}

	get_graph_list(page){
		const main = this
		const offset = COUNT * (page === undefined ? this.state.page : page)
		const data = {
			url: 'http://www.graphspace.org/api/v1/graphs/?is_public=1&limit=' + COUNT + '&offset=' + offset,
			method: 'GET',
			headers: JSON.stringify({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa(main.props.email + ':' + main.props.password)
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
				main.setState({networks: json['graphs'], page: page})
			}
		})
	}

	importNetwork = (id) => {
		const data = {url: 'http://www.graphspace.org/api/v1/graphs/' + id,
			method: 'GET',
			headers: JSON.stringify({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa(this.props.email + ':' + this.props.password)
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
				window.loadJSON(json['style_json'])
				window.cy.json(json['graph_json'])
				//window.cy.style(json['style_json']['style'])
				window.imported = json
				window.cy.fit()
			}
		})
	}

	render(){
		const main = this;
		const elements = this.state.networks.map(function(a, k){
			return <a className='list-group-item' key={k} onClick={() => window.graphspaceImportID.value = a['id']}>
				{a['name']}<span className='graphspace-date badge'>{new Date(a['created_at']).toLocaleString()}</span>
			</a>
		})

		const pagination = []
		const max = this.state.networks < COUNT ? this.state.page : this.state.page + 2
		for (var i = Math.max(0, this.state.page - 1); i < max; i++){
			pagination.push(<li className={i === this.state.page ? 'active' : ''} key={i}><a value={i} onClick={(v) => {
				main.get_graph_list(parseInt(v.target.getAttribute('value')))
			}}>{i+1}</a></li>)
		}

		return <div className="graphspace-list-container">
			<ul className="list-group graphspace-list">
				{elements || 'Loading...'}
			</ul>
			<div className="graphspace-list-buttons">
				<ul className="pagination">
					{pagination}
				</ul>
				<div className='graphspace-import'>
					<input id='graphspaceImportID' placeholder="GraphSpace ID"/>
					<button className='btn-default' onClick={() => main.importNetwork(window.graphspaceImportID.value)}>Import</button>
				</div>
			</div>
		</div>
	}
}
