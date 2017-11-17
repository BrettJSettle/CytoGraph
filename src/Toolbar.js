import React, { Component } from 'react';
import FA from 'react-fontawesome'
import { ButtonGroup, Button, Nav, NavItem } from 'react-bootstrap';
import Filter from './Filter.js'
import './css/Toolbar.css'


export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: true,
			activeTool: 'Create',
		};
		this.tools = [
      {title: 'Mouse', icon: <FA name="mouse-pointer"/>},
			{title: 'Create', icon: <FA name="plus-circle"/>},
			{title: 'Remove', icon: <FA name="minus-circle"/>}
		]
    this.actions = [
      {title: 'Undo', icon: <FA name="undo"/>, onClick: () => window.undoRedo.undo() },
      {title: 'Redo', icon: <FA name="repeat"/>, onClick: () => window.undoRedo.redo()},
    ]
  }

	handleNav(tab){
		let newState = {activeTool: tab}
		this.setState(newState)
    window.settings['mode'] = tab
		window.cy.edgehandles(tab === 'Create' ? 'enable' : 'disable')
	}

  render() {
		const main = this;
		const tools = this.tools.map(function(item, k) {
			return <NavItem key={k} eventKey={item.title} onClick={() => main.handleNav(item.title)}>{item.icon}</NavItem>
		});

    const actions = this.actions.map(function(item, k) {
        return <Button key={k} onClick={item.onClick}>{item.icon}</Button>
    });


    return (
      <div className="Toolbar">
				<Filter />
				<Nav className="ToolNav" bsStyle="tabs" activeKey={this.state.activeTool} onSelect={() => { }}>
          {tools}
        </Nav>
        <ButtonGroup vertical className="Toolbar-undo-redo">
          {actions}
        </ButtonGroup>
      </div>
    );
  }
}
