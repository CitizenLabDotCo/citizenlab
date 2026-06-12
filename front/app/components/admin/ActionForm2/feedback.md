# Feedback

- The 'require recent confirmation' needs to be implemented for phone number and identity verification too
- Besides 'anyone', 'require sign-in', we also need 'admins and collaborators only'
- We need another section: data collection (see below)
- The interface is WAY too full now at a first glance. We should somehow make it possible to hide parts and only make them visible when needed.

## Anonymity section

For this, you can look at e.g. front/app/components/admin/ActionForm/DataCollection/index.tsx. This setting might seem contradictory with the "What we ask participants" setting, but it's really not: it's perfectly logical to ask someone for their name, but still let them take the action anonymously (e.g. if the action is taking a survey, not link their profile to the survey).

## Feedback 2

- Change 'admins only' to 'admins and managers only'
- We will need to add a setting related to where we ask demographic fields. The options are: "Ask demographic questions before user participates" and "Collect demographic questions by adding a new page to the end of the form"
- When choosing 'anyone' or 'admins and managers only', the demographic fields + where to ask setting should still be visible
- When 'anyone' is chosen, however, the only allowed setting is "Collect demographic questions by adding a new page to the end of the form"
- For the groups, we need a 'customize error message' button where you can see the default error message that users see ("You do not meet the requirements to participate in this process.") and where you can override this in every language configured on the platform.
- For the verification method, we also need to have a place where you can open a modal where you can see which fields the verification method returns. A verification method can e.g. return a name and other demographics. Some of these fields can be 'locked', meaning that the user cannot change them, but not necessarily all of them.
