import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { nextEvent } from '../helpers/date.js';

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

    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    var nextEventDate = nextEvent();

    if(Meteor.settings.public.lockdown && new Date().valueOf() > (nextEventDate.valueOf() - (Meteor.settings.public.lockdown * 60000))) {
      throw new Meteor.Error('too late');
    }

    if(info.length > 50) {
      throw new Meteor.Error('too long');
    }

    var currentEvent = Events.findOne({date: nextEventDate});

    if(currentEvent) {
      if(currentEvent.members && currentEvent.members.find((element) => { return element.memberId == memberId })) {
        Events.update({_id: currentEvent._id, "members.memberId": memberId}, { $set: { "members.$.status": status, "members.$.info": info, "members.$.modifiedAt": new Date() } });
      } else {
        var member = {memberId: memberId, status: status, info: info, createdAt: new Date()};

        Events.update({_id: currentEvent._id}, { $push: { members: member } });
      }
    }
  },
  'currentEvent.removeMember': function(memberId) {
    check(memberId, String);

    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    var nextEventDate = nextEvent();

    if(Meteor.settings.public.lockdown && new Date().valueOf() > (nextEventDate.valueOf() - (Meteor.settings.public.lockdown * 60000))) {
      throw new Meteor.Error('too late');
    }

    var currentEvent = Events.findOne({date: nextEventDate});
    if(currentEvent) {
      Events.update({_id: currentEvent._id}, { $pull: { members: { memberId: memberId } } });
    }
  }
});
