import React, { Component } from 'react';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { ButtonToolbar, Nav, NavItem, Button } from 'react-bootstrap';
import './css/DockPanel.css'

import ScriptEditor from './ScriptEditor.js'
//import Table from './DataGrid.js'
import Table from './VisualizeGrid.js'

import Dock from 'react-dock';

const DEFAULT_SIZE=.3

const styles = {
  root: {
    fontSize: '16px',
    color: '#999',
    height: '100vh'
  },
  dockContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'center',
    flexDirection: 'column',
		background: 'red',
	},
	hideButtonStyle: {
		fontSize: '1.5em',
		padding: '0',
		height: '43px',
		boxShadow: 'none',
		borderRadius: '0',
	},
	hideIconStyle: {
		padding: '10px',
		verticalAlign: 'middle'
	},
	showIconStyle: {
		fontSize: '1.5em',
		cursor: "pointer",
		height: '100%',
		width: '100%',
	}
}

export default class DockPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: true,
      size: DEFAULT_SIZE,
			activeTab: 'Table',
			buttons: undefined,
		};
    this.tabs = ['Table','Script']
	}

	handleNav(tab){
		let newState = {activeTab: tab}
		if (this.state.size <= .1){
			newState.size = .3
		}
		this.setState(newState)
	}

  render() {
		const main = this;
		const tabs = this.tabs.map(function(item, k) {
			return <NavItem key={k} eventKey={item} onClick={() => main.handleNav(item)}>{item}</NavItem>
		});

		const dockNav = (<div className="DockNav-container">
			<Nav className="DockNav" bsStyle="tabs" activeKey={this.state.activeTab}>
				{tabs}
			</Nav>
				<ButtonToolbar id="dock-buttons">
					<Button style={styles.hideButtonStyle} onClick={() => main.setState({isVisible: false})}>
						<Glyphicon style={styles.hideIconStyle} glyph="chevron-down" />
					</Button>
				</ButtonToolbar>
		</div>);

    return (
      <div className="DockPanel" style={[styles.root]}>
				{(!this.state.isVisible || this.state.size < .05) &&
					<Button style={{position:'absolute', right: 0, bottom:0, height: '50px', width: '50px'}} onClick={() => main.setState({isVisible: true, size: DEFAULT_SIZE})}>
						<Glyphicon id="showGlyph" style={styles.showIconStyle} glyph="chevron-up"/>
					</Button>
				}
				<Dock
           className="Dock"
					 position='bottom'
           size={this.state.size}
           dimStyle={{display: 'none'}}
					 isVisible={this.state.isVisible}
           onVisibleChange={this.handleVisibleChange}
           onSizeChange={this.handleSizeChange}>
        {({ position, isResizing }) =>
          <div style={[styles.dockContent]} className="dock-container">
						{dockNav}
						<div id="tab-container">
							<div id="tab-content" style={{display: this.state.activeTab === 'Table' ? 'block' : 'none'}}>
						 		<Table />
							</div>
							<div id="tab-content" style={{display: this.state.activeTab === 'Script' ? 'block' : 'none'}}>
								<ScriptEditor />
							</div>
						</div>
					</div>
          }
        </Dock>
      </div>
    );
  }

  handleVisibleChange = isVisible => {
    this.setState({ isVisible });
  }

  handleSizeChange = size => {
		size = Math.min(.9, size)
    this.setState({ size: size });
  }
}
