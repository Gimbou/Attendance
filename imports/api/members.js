import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Members = new Mongo.Collection('members');

if (Meteor.isServer) {
  Meteor.publish('members', function membersPublication() {
    return Members.find({}, {sort: {name: 1}});
  });
}

Meteor.methods({
  'members.insertMember': function(name) {
    check(name, String);

    if(name.length > 10) {
      throw new Meteor.Error('too long');
    }

    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if(Members.find({name: name}).count() === 0) {
      Members.insert({name: name, createdAt: new Date()});
    }
  }
});