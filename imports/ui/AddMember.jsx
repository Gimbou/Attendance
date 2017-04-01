import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Button, FormGroup, InputGroup, FormControl } from 'react-bootstrap';

import { Members } from '../api/members.js';

export default class addMember extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleAddMember = this.handleAddMember.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleAddMember(event) {
    event.preventDefault();

    const member = this.state.value.trim();

    if(member) {
      Meteor.call('members.insertMember', member);
    }

    this.setState({value: ''});
  }

  render() {
    return (
      <div className="addMemberContainer">
        <form className="addMember" onSubmit={this.handleAddMember}>
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Uusi pelaaja"
                value={this.state.value}
                onChange={this.handleChange}
                maxLength="10"
              />
              <InputGroup.Button>
                <Button type="submit">Lisää</Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </form>
      </div>
    );
  }
}
