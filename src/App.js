import React, { Component } from 'react';
import Toolbar from './Toolbar.js'
import ScriptEditor from './ScriptEditor.js'
import DockPanel from './DockPanel.js'
import SettingsPanel from './SettingsPanel.js'

class App extends Component {
	render() {
		return (
			<div className='App'>
				<Toolbar />
				<DockPanel
					className="ScriptDock"
					glyph='terminal'
					position='bottom'>
					<ScriptEditor />
				</DockPanel>
				<DockPanel
					className="SettingsDock"
					glyph='paint-brush'
					position="right">
					<SettingsPanel />
				</DockPanel>
			</div>
		);
	}
}

export default App;

