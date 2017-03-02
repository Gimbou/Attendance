import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { underscore } from 'underscore';
import { FormControl } from 'react-bootstrap';

import Event from './Event.jsx';
import MemberlistContainer from './Memberlist.jsx';
import AddMember from './AddMember.jsx';

import { Events } from '../api/events.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleLogin(event) {
    event.preventDefault();

    const password = this.state.value.trim();

    Meteor.loginWithPassword('user', password);

    this.setState({value: ''});
  }

  render() {
    var currentEvent = this.props.currentEvent;

    var count = currentEvent ? _.countBy(currentEvent.members, (member) => {return member.status == 'YES' ? 'yes' : member.status == 'MAYBE' ? 'maybe' : member.status == 'NO' ? 'no' : 0}) : 0;
    var playersNeeded = count.yes ? 6 - count.yes : 6;
    var weWillPlay = count.yes >= 6 ? 'PELIT ON! Olkaa ajoissa paikalla.' : playersNeeded > 1 ? 'Tarvitaan vielä ' + playersNeeded + ' pelaajaa' : 'Tarvitaan vielä ' + playersNeeded + ' pelaaja';
    var weWillPlayColor = count.yes >= 6 ? 'weWillPlay weWillPlayGreen' : playersNeeded > 1 ? 'weWillPlay weWillPlayRed' : 'weWillPlay weWillPlayRed';

    return (
      <div className="page-container">
        {this.props.currentUser ?
          <div className="content-container">
            <header>
              <Event currentEvent={currentEvent} />
              <div className={weWillPlayColor}>{weWillPlay}</div>
            </header>
            {count.yes > 0 &&
              <div className="comingList">
                <div className="comingListHeader">Tulossa: {count.yes}</div>
                <MemberlistContainer currentEvent={currentEvent} status="YES" />
              </div>
            }
            {count.maybe > 0 &&
              <div className="maybeList">
                <div className="maybeListHeader">Ehkä: {count.maybe}</div>
                <MemberlistContainer currentEvent={currentEvent} status="MAYBE" />
              </div>
            }
            {count.no > 0 &&
              <div className="noList">
                <div className="noListHeader">Ei: {count.no}</div>
                <MemberlistContainer currentEvent={currentEvent} status="NO" />
              </div>
            }
            <div className="membersHeader">Pelaajat</div>
            <AddMember />
            <div className="memberList">
              <MemberlistContainer currentEvent={currentEvent} />
            </div>
          </div> : 
          <div className="login">
            <div className="loginHeader">Sählyvuoro</div>
            <form className="loginForm" onSubmit={this.handleLogin} >
              <FormControl
                type="password"
                placeholder="Salasana"
                value={this.state.value}
                onChange={this.handleChange}
              />
            </form>
          </div>
        }
      </div>
    );
  }
}

App.propTypes = {
  currentEvent: PropTypes.object,
  currentUser: PropTypes.object
};

export default createContainer(() => {
  Meteor.subscribe('currentEvent');

  return {
    currentEvent: Events.findOne(),
    currentUser: Meteor.user()
  };
}, App);
