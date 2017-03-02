import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Button, ButtonGroup, FormControl, Glyphicon } from 'react-bootstrap';

import { Members } from '../api/members.js';

class Memberlist extends Component {
	constructor(props) {
    super(props);
    this.state = {target: null, value: '', oldValue: '', member: ''};

    this.handleFocus = this.handleFocus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMemberStatusChange = this.handleMemberStatusChange.bind(this);
    this.handleMemberRemoveFromEvent = this.handleMemberRemoveFromEvent.bind(this);
  }

  handleFocus(event) {
  	if(this.state.target && this.state.target != event.target) {
  		this.state.target.value = this.state.oldValue;
  	}

    this.setState({target: event.target, value: event.target.value, oldValue: event.target.value, member: event.currentTarget.parentNode.id});
  }

  handleChange(event) {
    this.setState({target: event.target, value: event.target.value, member: event.currentTarget.parentNode.id});
  }

	isMemberInEvent(memberId) {
		return this.props.currentEvent.members ? this.props.currentEvent.members.find((element) => { return element.memberId == memberId }) : '';
	}

	handleMemberStatusChange(event) {
		event.preventDefault();

		var memberId = event.currentTarget.parentNode.id;
		var status = event.currentTarget.value;
		var info = '';

		if(this.state.member && this.state.value && this.state.target) {		
			if(memberId == this.state.member) {
				info = this.state.value.trim();
			} else {
				this.state.target.value = this.state.oldValue;
			}
		}

		Meteor.call('currentEvent.setMemberStatus', memberId, status, info);

		this.setState({target: null, value: '', oldValue: '', member: ''});
	}

	handleMemberRemoveFromEvent(event) {
		event.preventDefault();

		var memberId = event.currentTarget.parentNode.id;

		Meteor.call('currentEvent.removeMember', memberId);

		this.setState({target: null, value: '', oldValue: '', member: ''});
	}

	renderMembers() {
		const { status } = this.props;
		return this.props.members.map((member) => {
			var isMemberInEvent = this.isMemberInEvent(member._id);
			var memberInfo = isMemberInEvent ? isMemberInEvent.info : '';
			if((!status && !isMemberInEvent) || (isMemberInEvent && status == isMemberInEvent.status)) {	
	      return (
	      	<div key={member._id} className="memberContainer">
		        <div key="row" className="member">
		        	<span key="name" className="memberName">{member.name}</span>
		        	<span key="buttons" className="buttons">
			        	<ButtonGroup key="ButtonGroup{member._id}" id={member._id} ref={member._id}>
				        	<Button bsStyle="success" key="YES" value="YES" onClick={this.handleMemberStatusChange}><Glyphicon glyph="thumbs-up" /></Button>
				        	<Button bsStyle="warning" key="MAYBE" value="MAYBE" onClick={this.handleMemberStatusChange}><Glyphicon glyph="question-sign" /></Button>
				        	<Button bsStyle="danger" key="NO" value="NO" onClick={this.handleMemberStatusChange}><Glyphicon glyph="thumbs-down" /></Button>
				        	{isMemberInEvent && <Button type="button" key="{member._id}REMOVE" onClick={this.handleMemberRemoveFromEvent}><Glyphicon glyph="remove" /></Button>}
			        	</ButtonGroup>
		        	</span>
		        	<span key="info" className="info" id={member._id}>
			        	<FormControl
				          type="text"
				          placeholder="Viesti"
				          defaultValue={memberInfo}
				          onFocus={this.handleFocus}
				          onChange={this.handleChange}
				          maxLength="50"
			        	/>
		        	</span>
		        </div>
	        </div>
	      );
			}
    });
	}

  render() {
    return (
			<div className="memberlist">
				{this.renderMembers()}
			</div>
    );
  }
}

Memberlist.propTypes = {
  members: PropTypes.array,
  currentEvent: PropTypes.object,
  status: PropTypes.string
};

export default MemberlistContainer = createContainer(() => {
  Meteor.subscribe('members');

  return {
    members: Members.find({}).fetch()
  };
}, Memberlist);