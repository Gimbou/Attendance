const nextDay = (x) => {
  var now = new Date();    
  now.setDate(now.getDate() + (x+(7-now.getDay())) % 7);
  return now;
}

export const nextEvent = () => {
  var date = new Date(nextDay(Meteor.settings.public.weekday).toDateString());
  date.setHours(Meteor.settings.public.time);
  return date;
}
