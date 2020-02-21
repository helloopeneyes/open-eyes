export function getUserIdentifier(user) {
  if (!user) return null;
  if (user.provider === "email" || user.provider === "google-oauth2") {
    const email = user.emails && user.emails.length && user.emails[0].value;
    if (!email) return null;
    const [id, domain] = email.split("@");
    const realId = id.split("+")[0];
    return `${realId}@${domain}`;
  } else {
    return user.id;
  }
}
