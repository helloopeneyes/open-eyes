export function getUserEmail(user) {
  return user && user.emails && user.emails.length && user.emails[0].value;
}
