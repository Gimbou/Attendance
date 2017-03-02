import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';
import 'moment/locale/fi';

moment.locale('fi');

export default class Event extends Component {
  render() {
    const { currentEvent } = this.props;
    var date;
    var toDate;

    if(currentEvent) {
      date = moment(currentEvent.date).format("dddd DD.MM.YYYY [klo] HH:mm");
      date = date.charAt(0).toUpperCase() + date.slice(1);
      toDate = moment(currentEvent.date).fromNow();
    }

    return (
      <div className="event">
        <div>
          <span className="date">{date}</span> <span className="countdown">({toDate})</span>
        </div>
        <div className="extraInfo">Bommari kenttä 1</div>
      </div>
    );
  }
}

Event.propTypes = {
  currentEvent: PropTypes.object
};