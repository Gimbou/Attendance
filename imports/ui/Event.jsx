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
    var place = Meteor.settings.public.place;

    if(currentEvent) {
      date = moment(currentEvent.date).format("dddd DD.MM.YYYY [klo] HH:mm");
      date = date.charAt(0).toUpperCase() + date.slice(1);
      toDate = moment(currentEvent.date).fromNow();
      toDate = toDate.charAt(0).toUpperCase() + toDate.slice(1);
    }

    return (
      <div className="event">
        <div className="date">{date}</div>
        <div className="countdown">{toDate}</div>
        <div className="extraInfo">{place}</div>
      </div>
    );
  }
}

Event.propTypes = {
  currentEvent: PropTypes.object
};
