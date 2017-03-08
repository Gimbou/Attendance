import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Button, ButtonGroup, FormControl, Glyphicon } from 'react-bootstrap';

import { Members } from '../api/members.js';

class Memberlist extends Component {
	constructor(props) {
    super(props);
    this.state = {target: null, value: '', member: '', memberInfo: ''};

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMemberStatusChange = this.handleMemberStatusChange.bind(this);
    this.handleMemberRemoveFromEvent = this.handleMemberRemoveFromEvent.bind(this);
  }

  handleFocus(event) {
  	var isMemberInEvent = this.isMemberInEvent(event.currentTarget.parentNode.id);

  	if(!isMemberInEvent && this.state.target && event.target != this.state.target) {
  		this.state.target.value = '';
  		this.setState({memberInfo: ''});
  	}

  	event.target.className = 'form-control';
  }

  handleBlur(event) {
  	var isMemberInEvent = this.isMemberInEvent(event.currentTarget.parentNode.id);
  	
  	if(isMemberInEvent) {
  		event.target.className = 'plainInput form-control';

	  	var memberId = isMemberInEvent.memberId;
			var status = isMemberInEvent.status;
			var info = event.target.value.trim();

			Meteor.call('currentEvent.setMemberStatus', memberId, status, info);

			this.setState({member: '', memberInfo: ''});
		}
  }

  handleChange(event) {
    this.setState({target: event.target, value: event.target.value, member: event.currentTarget.parentNode.id, memberInfo: event.target.value});
  }

	isMemberInEvent(memberId) {
		return this.props.currentEvent.members ? this.props.currentEvent.members.find((element) => { return element.memberId == memberId }) : '';
	}

	handleMemberStatusChange(event) {
		event.preventDefault();

		var memberId = event.currentTarget.parentNode.id;
		var status = event.currentTarget.value;
		var info = '';

		var isMemberInEvent = this.isMemberInEvent(memberId);

		if(!isMemberInEvent && this.state.member && this.state.value && memberId == this.state.member) {		
			info = this.state.value.trim();
		} else if(isMemberInEvent) {
			info = isMemberInEvent.info;
		}

		Meteor.call('currentEvent.setMemberStatus', memberId, status, info);

		this.setState({member: '', memberInfo: ''});
	}

	handleMemberRemoveFromEvent(event) {
		event.preventDefault();

		var memberId = event.currentTarget.parentNode.id;

		Meteor.call('currentEvent.removeMember', memberId);

		this.setState({member: '', memberInfo: ''});
	}

	renderMembers() {
		const { status, currentEvent } = this.props;
		
		var signingDisabled = false;

		if(Meteor.settings.public.lockdown && currentEvent && new Date().valueOf() > (currentEvent.date.valueOf() - (Meteor.settings.public.lockdown * 60000))) {
      signingDisabled = true;
    }

		return this.props.members.map((member) => {
			var isMemberInEvent = this.isMemberInEvent(member._id);
			var memberInfo = this.state.memberInfo && this.state.member == member._id ? this.state.memberInfo : isMemberInEvent ?  isMemberInEvent.info : '';
			memberInfo = !this.state.memberInfo && this.state.member == member._id ? '' : memberInfo;
			var inputStyle = isMemberInEvent ? 'plainInput' : '';

			if((!status && !isMemberInEvent) || (isMemberInEvent && status == isMemberInEvent.status)) {	
	      return (
	      	<div key={member._id} className="memberContainer">
		        <div key="row" className="member">
		        	<span key="name" className="memberName">{member.name}</span>
		        	<span key="buttons" className="buttons">
			        	<ButtonGroup key="ButtonGroup{member._id}" id={member._id} ref={member._id}>
				        	<Button bsStyle="success" key="YES" value="YES" onClick={this.handleMemberStatusChange} disabled={signingDisabled}><Glyphicon glyph="thumbs-up" /></Button>
				        	<Button bsStyle="warning" key="MAYBE" value="MAYBE" onClick={this.handleMemberStatusChange} disabled={signingDisabled}><Glyphicon glyph="question-sign" /></Button>
				        	<Button bsStyle="danger" key="NO" value="NO" onClick={this.handleMemberStatusChange} disabled={signingDisabled}><Glyphicon glyph="thumbs-down" /></Button>
				        	{isMemberInEvent && <Button type="button" key="{member._id}REMOVE" onClick={this.handleMemberRemoveFromEvent} disabled={signingDisabled}><Glyphicon glyph="remove" /></Button>}
			        	</ButtonGroup>
		        	</span>
		        	<span key="info" className="info" id={member._id}>
			        	<FormControl className={inputStyle}
				          type="text"
				          placeholder="Viesti"
				          value={memberInfo}
				          onFocus={this.handleFocus}
				          onBlur={this.handleBlur}
				          onChange={this.handleChange}
				          maxLength="50"
				          disabled={signingDisabled}
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
    members: Members.find({}, {sort: {name: 1}}).fetch()
  };
}, Memberlist);