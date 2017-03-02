import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { nextDay, nextEvent } from '../helpers/date.js';

export const Events = new Mongo.Collection('events');

if (Meteor.isServer) {
  Meteor.publish('currentEvent', function currentEventPublication() {
    return Events.find({date: nextEvent()});
  });
}

Meteor.methods({
  'currentEvent.setMemberStatus': function(memberId, status, info) {
    check(memberId, String);
    check(status, String);
    check(info, String);

    if(info.length > 50) {
      throw new Meteor.Error('too long');
    }

    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    var currentEvent = Events.findOne({date: nextEvent()});

    if(currentEvent) {
      if(currentEvent.members && currentEvent.members.find((element) => { return element.memberId == memberId })) {
        Events.update({_id: currentEvent._id, "members.memberId": memberId}, { $set: { "members.$.status": status, "members.$.info": info } });
      } else {
        var member = {memberId: memberId, status: status, info: info};

        Events.update({_id: currentEvent._id}, { $push: { members: member } });
      }
    }
  },
  'currentEvent.removeMember': function(memberId) {
    check(memberId, String);

    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    var currentEvent = Events.findOne({date: nextEvent()});
    if(currentEvent) {
      Events.update({_id: currentEvent._id}, { $pull: { members: { memberId: memberId } } });
    }
  }
});
