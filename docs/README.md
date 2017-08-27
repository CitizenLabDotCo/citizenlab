# Changelog

## 2017-08-27

### Fixed
- Changing the logo and background image in admin settings works
- Platform works for users with an unsupported OS language

### Added
- Admin dashboard
- Default topics and idea statuses for newly deployed platforms
- Proper UX for handling voting without being signed in
- Meta tags for SEO and social sharing
- Better error handling in project admin

### Changed
- Projects and user profile pages now use slugs in the URL

## 2017-08-18

### Fixed
- Changing idea status in admin
- Signing up
- Proper rending of menu bar within a project
- Admin settings are properly rendered within the tab container
- Lots of small tweaks to rendering on mobile
- Default sort ideas on trending on the ideas index page

### Added
- Admin section in projects to CRUD phases
- Admin section in projects to CRUD events
- New navbar on mobile
- Responsive version of idea show page

### Changed
- Navbar design updated
- One single login flow experience instead of 2 separate ones (posting idea/direct)
- Admins can only specify light/dark for menu color, not the exact color

### Removed
- Facebook login (Yet to be added to new login flow, will be back soon)

## 2017-08-13

### Fixed

* Voting on cards and in an idea page
* Idea modal loading speed
* Unread notification counter

### Added

* New improved flow for posting an idea
* Admin interface for projects
* New design for idea and project cards
* Consistenly applied modal, with new design, for ideas
* Segment.io integration, though not all events are tracked yet

### Changed

* Idea URls now using slugs for SEO
