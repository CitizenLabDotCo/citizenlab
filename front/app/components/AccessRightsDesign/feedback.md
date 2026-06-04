# Feedback

- The 'require recent confirmation' needs to be implemented for phone number and identity verification too
- Besides 'anyone', 'require sign-in', we also need 'admins and collaborators only'
- We need another section: data collection (see below)
- The interface is WAY too full now at a first glance. We should somehow make it possible to hide parts and only make them visible when needed.

## Anonymity section

For this, you can look at e.g. front/app/components/admin/ActionForm/DataCollection/index.tsx. This setting might seem contradictory with the "What we ask participants" setting, but it's really not: it's perfectly logical to ask someone for their name, but still let them take the action anonymously (e.g. if the action is taking a survey, not link their profile to the survey).
