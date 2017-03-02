import { Accounts } from 'meteor/accounts-base';
import { Events } from './events.js';
import { nextDay, nextEvent } from '../helpers/date.js';

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true
});

Accounts.onLogin(() => {
  if (Events.find({date: nextEvent()}).count() === 0) {
    Events.insert({
      date: nextEvent(),
      createdAt: new Date()
    });
  }
});