import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { underscore } from 'underscore';
import { Button, FormGroup, InputGroup, FormControl, Glyphicon } from 'react-bootstrap';

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

  handleLogout(event) {
    event.preventDefault();

    Meteor.logout();
  }

  render() {
    document.title = Meteor.settings.public.title;
    var title = Meteor.settings.public.title;

    var currentEvent = this.props.currentEvent;

    var signingDisabled = false;
    var count = 0;
    var playersNeeded = 0;
    var weWillPlay = '';
    var weWillPlayColor = '';
    
    if(currentEvent) {
      if(Meteor.settings.public.lockdown && new Date().valueOf() > (currentEvent.date.valueOf() - (Meteor.settings.public.lockdown * 60000))) {
        signingDisabled = true;
      }

      count = _.countBy(currentEvent.members, (member) => {return member.status == 'YES' ? 'yes' : member.status == 'MAYBE' ? 'maybe' : member.status == 'NO' ? 'no' : 0});
      
      if(Meteor.settings.public.playerCount) {
        playersNeeded = count.yes ? Meteor.settings.public.playerCount - count.yes : Meteor.settings.public.playerCount;

        if(count.yes >= Meteor.settings.public.playerCount) {
          weWillPlay = 'PELIT ON! Olkaa ajoissa paikalla.';
          weWillPlayColor = 'weWillPlay weWillPlayGreen';
        } else if(signingDisabled) {
          weWillPlay = 'Ilmoittautuminen on loppunut, tänään EI OLE pelejä :( Olisi tarvittu vielä ' + playersNeeded + ' pelaajaa...';
          weWillPlayColor = 'weWillPlay weWillPlayRed';
        } else if(playersNeeded > 1) {
          weWillPlay = 'Tarvitaan vielä ' + playersNeeded + ' pelaajaa';
          weWillPlayColor = 'weWillPlay weWillPlayRed';
        } else {
          weWillPlay = 'Tarvitaan vielä ' + playersNeeded + ' pelaaja';
          weWillPlayColor = 'weWillPlay weWillPlayRed';
        }
      }
    }

    return (
      <div className="page-container">
        {this.props.currentUser ?
          <div className="content-container">
            <div className="logoutButtonContainer">
              <Button key="logout" className="logoutButton" onClick={this.handleLogout}><Glyphicon glyph="log-out" /></Button>
            </div>
            <header>
              <Event currentEvent={currentEvent} />
              {Meteor.settings.public.playerCount && <div className={weWillPlayColor}>{weWillPlay}</div>}
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
            <div className="loginHeader">{title}</div>
            <div className="loginFormContainer">
              <form className="loginForm" onSubmit={this.handleLogin} >
                <FormGroup>
                  <InputGroup>
                    <FormControl
                      autoFocus
                      type="password"
                      placeholder="Salasana"
                      value={this.state.value}
                      onChange={this.handleChange}
                    />
                    <InputGroup.Button>
                      <Button type="submit">Kirjaudu</Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </form>
            </div>
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
