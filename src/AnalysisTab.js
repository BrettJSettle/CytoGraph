import React, { Component } from 'react'
import FA from 'react-fontawesome'
import './css/AnalysisTab.css'
import AceEditor from 'react-ace'
import 'brace/mode/javascript';
import 'brace/theme/monokai'

export default class AnalysisTab extends Component {
	constructor(props){
		super(props)
		this.state = {
			onRun: props.onRun,
			scriptOpen: false,
			script: "",
			fontSize: 14,

		}
	}

	runPressed(){
		if (this.state.onRun){
			this.state.onRun(this.state.script)
		}
	}

	render(){
		let comp = this;
		return (
			<div className="AnalysisTab">
					
					<div className="panel-group" style={{'marginBottom': 0}}>
					  <div className="panel panel-default">
							<div className="panel-heading">
								<div className="AnalysisButtons">
								{this.state.scriptOpen && 
									<button className="run-script" onClick={() => comp.runPressed()}>
										<FA name="play-circle" size="2x"/>
									</button>
									}
									<button >
										<a data-toggle="collapse" href="#collapse1" onClick={() => {
											if (!comp.state.scriptOpen)
												document.getElementsByClassName("ace_content")[0].focus()
											else
												document.activeElement.blur()
											comp.setState({scriptOpen: !comp.state.scriptOpen})
											}
										}>
											<FA name="file-code-o" size="2x"/>
										</a>
									</button>
									{/*<button data-toggle="modal" data-target="#dbModal">
										<FA name="database" size="2x"/>
									</button>*/}
								</div>
							</div>
							<div id="collapse1" className="panel-collapse collapse">
								<div className="panel-body">
									<AceEditor
										style={{width: '100%', height: '100%'}}
										mode="javascript"
										theme="monokai"
										name="scriptArea"
										onChange={(e) => {comp.setState({script: e})}}
										fontSize={14}
										showPrintMargin={false}
										showGutter={true}
										highlightActiveLine={true}
										value={this.state.script}
										setOptions={{
											enableBasicAutocompletion: true,
											enableLiveAutocompletion: true,
											enableSnippets: false,
											showLineNumbers: true,
											tabSize: 2,
										}}/>
								</div>
								<div className="panel-footer">
									<textarea className="outputArea" spellCheck="false" disabled/>
								</div>
							</div>
						</div>
					</div>
				
		</div>
		);
	}
}

