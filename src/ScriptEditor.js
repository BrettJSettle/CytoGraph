import React, {Component} from 'react'
//import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/theme/monokai'
import './css/ScriptEditor.css'

import {ToggleButtonGroup, ToggleButton, Button} from 'react-bootstrap'
import Glyphicon from 'react-bootstrap/lib/Glyphicon';


export default class ScriptEditor extends Component {
	constructor(){
		super()
		this.state = {
			tab: 'script'
		}
	}

	playPressed = () => {
		window.clearLog()
		let scr = document.getElementById("scriptTag")
		if (scr)
				scr.remove()
		const script = window.editor.getValue()
		var tag = document.createElement('script');
		tag.id = "scriptTag"
		tag.async = true;
		tag.append( "window.runScript = () => { " + script + "}")
		var output = document.getElementById('output')
		try {
			document.getElementsByTagName('body')[0].appendChild(tag);
			window.runScript()
			if (output)
				output.style.color = 'gray'
		} catch (e){
			console.log("ERROR: " + e)
			window.log(e.stack)
			if (output)
				output.style.color = 'red'
		}
	}

	componentDidMount(){
		window.addEventListener('load', function() {
			const editor = window.editor = window.ace.edit('aceEditor')
			editor.setTheme('ace/theme/monokai')
			const sesh = editor.getSession()
			sesh.setMode('ace/mode/javascript')
			sesh.setTabSize(2)
			editor.setHighlightActiveLine(true)
			editor.setShowPrintMargin(false)
			window.addEventListener('resize', function(){
				window.editor.resize()
			})
		});
	}

	render(){
		const comp = this;
		const buttons = (<div className='ScriptButtons TabToolbar'>
			<Button className="playButton" onClick={this.playPressed}>
				<Glyphicon glyph='play'/>
			</Button>
			<ToggleButtonGroup type="radio" name='type' value={this.state.tab} onChange={(val) => { comp.setState({tab: val}); } } vertical>
				<ToggleButton value='script'>Script</ToggleButton>
				<ToggleButton value='output'>Output</ToggleButton>
			</ToggleButtonGroup>
		</div>);

		return (
			<div className="ScriptEditor">
				{buttons}
				<div className="script-container">
					<div id="aceEditor"	style={{zIndex: this.state.tab === 'script' ? 5 : 4}}></div>
					<textarea
							style={{zIndex: this.state.tab === 'script' ? 4 : 5, position: 'absolute'}}
							id="output"
							className="output-area"
							spellCheck="false"
							disabled
					/>
			</div>
		</div>);
	}
}
