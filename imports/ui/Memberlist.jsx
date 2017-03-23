import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Button, ButtonGroup, FormControl, Glyphicon } from 'react-bootstrap';
import { sweetAlert } from 'sweetalert';
import 'sweetalert/dist/sweetalert.css';

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

		var name = Members.findOne({_id: memberId}).name;

		var title = '';
		var confirmButtonColor = '';

		if(status == 'YES') {
			title = "Lisätäänkö pelaaja <font color=\"#5cb85c\">" + name + "</font> tilaan \"<font color=\"#5cb85c\">Tulossa</font>\"?";
			confirmButtonColor = '#5cb85c';
		} else if(status == 'MAYBE') {
			title = "Lisätäänkö pelaaja <font color=\"#f0ad4e\">" + name + "</font> tilaan \"<font color=\"#f0ad4e\">Ehkä</font>\"?";
			confirmButtonColor = '#f0ad4e';
		} else if(status == 'NO') {
			title = "Lisätäänkö pelaaja <font color=\"#d9534f\">" + name + "</font> tilaan \"<font color=\"#d9534f\">Ei</font>\"?";
			confirmButtonColor = '#d9534f';
		}

		swal({
		  title: title,
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonColor: confirmButtonColor,
		  confirmButtonText: "Kyllä",
		  cancelButtonText: "Ei",
		  closeOnConfirm: true,
		  closeOnCancel: true,
		  allowEscapeKey: true,
		  allowOutsideClick: true,
		  html: true
		},
		function(isConfirm){
		  if (isConfirm) {
				var isMemberInEvent = this.isMemberInEvent(memberId);

				if(!isMemberInEvent && this.state.member && this.state.value && memberId == this.state.member) {		
					info = this.state.value.trim();
				} else if(isMemberInEvent) {
					info = isMemberInEvent.info;
				}

				Meteor.call('currentEvent.setMemberStatus', memberId, status, info);

				this.setState({member: '', memberInfo: ''});
		  }
		}.bind(this));
	}

	handleMemberRemoveFromEvent(event) {
		event.preventDefault();

		var memberId = event.currentTarget.parentNode.id;
		var name = Members.findOne({_id: memberId}).name;
		var title = "Poistetaanko pelaajan <font color=\"#AEDEF4\">" + name + "</font> ilmoittautumistilanne kokonaan?";

		swal({
		  title: title,
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonText: "Kyllä",
		  cancelButtonText: "Ei",
		  closeOnConfirm: true,
		  closeOnCancel: true,
		  allowEscapeKey: true,
		  allowOutsideClick: true,
		  html: true
		},
		function(isConfirm){
		  if (isConfirm) {
				Meteor.call('currentEvent.removeMember', memberId);

				this.setState({member: '', memberInfo: ''});
		  }
		}.bind(this));
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