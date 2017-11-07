import React, {Component} from 'react'
import { Thumbnail, Button, Checkbox, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import './css/Thumbnails.css'

export class ColorThumbnail extends Component {

	constructor(props){
		super(props)
		this.state = {
			title: props.title,
			value: props.value,
			default: props.default || '#666666',
		}
		this._onChange = props.onChange
	}

	onChange = (ev) => {
		const val = ev.target.value
		this.setState({value: val})
		this._onChange(this.validatedColor(val))
	}

	validatedColor = (col) => {
		if (col === undefined){
			col = this.state.value
			if (col === undefined)
				col = this.state.default
		}
		if (/(^#[0-9A-F]{6}$)/i.test(col)){
			return col
		}else{
			return this.state.default
		}
	}

	render(){
		const main = this;
		return (<Thumbnail>
			<FormGroup className='thumbnail-formgroup' controlId={this.state.title}>
				<ControlLabel>{this.state.title}</ControlLabel>
				<FormControl type="color" value={this.validatedColor()} onChange={this.onChange}/>
				<FormControl type="text" value={this.state.value} onChange={this.onChange}/>
				<Button onClick={() => { main._onChange(main.state.value) }} className="thumbnail-refresh">
					<Glyphicon glyph="refresh"/>
				</Button>
			</FormGroup>
		</Thumbnail>);
	}
}

export class RangeThumbnail extends Component {

	constructor(props){
		super(props)
		this.state = {
			title: props.title,
			min: props.min,
			step: props.step || 1,
			max: props.max,
			value: props.value,
		}
		this._onChange = props.onChange
	}

	onChange = (ev) => {
		const val = ev.target.value
		this._onChange(ev.target.value)
		this.setState({value: val})
	}

	render(){
		const main = this
		return (<Thumbnail>
			<FormGroup className='thumbnail-formgroup' controlId={this.state.title}>
				<ControlLabel>{this.state.title}</ControlLabel>
				<input type="range" value={this.state.value} step={this.state.step} min={this.state.min} max={this.state.max} onChange={this.onChange} />
				<p>{this.state.value}</p>
				<Button onClick={() => { main._onChange(main.state.value) }} className="thumbnail-refresh">
					<Glyphicon glyph="refresh"/>
				</Button>
			</FormGroup>
		</Thumbnail>);
	}
}

export class SelectThumbnail extends Component {

	constructor(props){
		super(props)
		this.state = {
			title: props.title,
			options: props.options,
			value: props.value,
		}
		this._onChange = props.onChange
	}

	onChange = (ev) => {
		const val = ev.target.value
		this._onChange(ev.target.value)
		this.setState({value: val})
	}

	render(){
		const main = this
		const options = this.state.options.map(function(item, k){
			return <option key={k} value={item}>{item}</option>
		});
		return (<Thumbnail>
			<FormGroup className='thumbnail-formgroup' controlId={this.state.title}>
				<ControlLabel>{this.state.title}</ControlLabel>
				<FormControl componentClass="select" onChange={this.onChange}>
					{options}
				</FormControl>
				<Button onClick={() => { main._onChange(main.state.value) } } className="thumbnail-refresh">
					<Glyphicon glyph="refresh"/>
				</Button>
			</FormGroup>
		</Thumbnail>);
	}
}

export class CheckboxThumbnail extends Component {
	constructor(props){
		super(props)
		this.state = {
			title: props.title,
			value: props.value,
		}
		this._onChange = props.onChange
	}

	onChange = (ev) => {
		this._onChange(!this.state.value)
		this.setState({value: !this.state.value})
	}

	render(){
		const main = this
		return (<Thumbnail>
			<FormGroup className='thumbnail-formgroup' controlId={this.state.title}>
				<ControlLabel></ControlLabel>
				<Checkbox checked={this.state.value} onChange={this.onChange}>{this.state.title}</Checkbox>
				<Button onClick={() => {main._onChange(main.state.value) }} className="thumbnail-refresh">
					<Glyphicon glyph="refresh"/>
				</Button>
			</FormGroup>
		</Thumbnail>);
	}

}


export class TextThumbnail extends Component {
	constructor(props){
		super(props)
		this.state = {
			title: props.title,
			value: props.value,
		}
		this._onChange = props.onChange
	}

	onChange = (ev) => {
		this._onChange(ev.target.value)
		this.setState({value: ev.target.value})
	}

	render(){
		const main = this
		return (<Thumbnail>
			<FormGroup className='thumbnail-formgroup' controlId={this.state.title}>
				<ControlLabel>{this.state.title}</ControlLabel>
				<textarea style={{resize: 'none', width: '100%'}} value={this.state.value} onChange={this.onChange}/>
			</FormGroup>
		</Thumbnail>);
	}

}
