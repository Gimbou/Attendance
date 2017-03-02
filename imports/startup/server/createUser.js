import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({username: 'user', password: '???'});
  }
});