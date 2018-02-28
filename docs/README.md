# Changelog

## 2018-02-26

### Fixed
- Project pages
  - Fixed header image not being centered
- Project timeline page
  - Fixed currently active phase not being selected by default
  - Fixed 'start an idea' button not being shown insde the empty idea container
  - Fixed 'start an idea' button not linking to the correct idea creation step
- Ideas and Projects filter dropdown
  - Fixed the dropdown items not always being clickable
- Navigation bar
  - Fixed avatar and options menu not showing on mobile devices
  
### Added
- Responsive admin sidebar
- Top navigation menu stays in place when scrolling in admin section on mobile devices

### Changed
- Project timeline
  - Better word-breaking of phases titles in the timeline

## 2018-02-22

### Fixed
- Idea page
  - Fixed voting buttons not being displayed when page is accessed directly
- Edit profile form page
  - Fixed broken input fields (first name, last name, password, ...)
  - Fixed broken submit button behavior
- Admin project section
  - Fixed default view (map or card) not being saved
  - Fixed save button not being enabled when an image is added or removed
- Project page
  - Fixed header navigation button of the current page not being highlighted in certain scenarios
  - Fixed no phase selected in certain scenarios
  - Fixed mobile timeline phase selection not working
- Idea cards
  - Fixed 'Load more' button being shown when no more ideas
- Project cards
  - Fixed 'Load more' button being shown when no more projects
- Idea page
  - Fixed faulty link to project page
- Add an idea > project selection page
  - Fixed broken layout on mobile devices

### Added
- Landing page
  - Added 'load more' button to project and idea cards
  - Added search, sort and filter by topic to idea cards
- Project card
  - Added ideas count
- Idea card
  - Added author avatar
  - Added comment count and icon
- Idea page
  - Added loading indicator
- Project page
  - Added loading indicator
  - Added border to project header buttons to make them more visible
- Admin page section
  - Added header options in rich-text editors

### Changed
- Navigation bar
  - Removed 'ideas' menu item
  - Converted 'projects' menu item into dropdown
  - Changed style of the 'Start an idea' button 
- Landing page
  - Header style changes (larger image dimensions, text centered)
  - Removed 'Projects' title on top of project cards
- Project card
  - Changed project image dimensions
  - Changed typography
- Idea card
  - Removed image placeholder
  - Reduced idea image height
- Filter dropdowns
  - Height, width and alignment changes for mobile version (to ensure the dropdown is fully visible on smaller screens)
- Idea page
  - Improved loading behavior
  - Relocated 'show on map' button to sidebar (above sharing buttons)
  - Automatically scroll to map when 'show on map' button is clicked
  - Larger font sizes and better overall typography for idea and comment text
  - Child comments style changes
  - Child commenting form style change
  - Comment options now only visible on hover on desktop
- Project page
  - Improved loading behavior
  - Timeline style changes to take into account longer project titles
  - Changed copy from 'timeline' to 'process'
  - Changed link from projects/<projectname>/timeline to projects/<projectname>/process
  - Events header button not being shown if there are no events
- Add an idea > project selection page
  - Improved project cards layout
  - Improved mobile page layout

## 2018-01-03

### Fixed
- Updating the bio on the profile page works again
- 2018 can be selected as the year of events/phases
- The project dropdown in the idea posting form no longer shows blank values
- Reset password email

### Added
- Ideas can be edited by admins and by their author
- An idea shows a changelog with its latest updates
- Improved admin idea manager
  - Bulk update project, topics and statuses of ideas
  - Bulk delete ideas
  - Preview the idea content
  - Links through to viewing and editing the idea
- When on a multi-lingual platform, the language can be changed in the footer
- The project pages now show previews of the project events in the footer
- The project card now shows a description preview text, which is changeable through the admin
- Images are automatically optimized after uploading, to reduce the file size

### Changed
- Image dimensions have changed to more optimal dimensions

## 2017-12-13

### Fixed
- The ideas of deleted users are properly shown
- Slider to make users admins is again functional

### Added
- The idea show page shows a project link
- Mentions are operational in comments
- Projects can be deleted in the admin

### Changed
- Ideas and projects sections switched positions on the landing page

## 2017-12-06

### Fixed
- Phases and events date-picker no longer overlaps with the description text
- No longer needed to hard refresh if you visited al old version of the platform
- Inconsistency when saving project permissions has been fixed
- Bullet lists are now working in project description, phases and events
- The notifications show the currect user as the one taking the action

### Added
- Translators can use `orgName` and `orgType` variables everywhere
- Previews of the correct image dimension when uploading images

### Changed
- Lots of styling tweaks to the admin interface
- Behaviour of image uploads has improved

## 2017-11-23

### Fixed
- Loading the customize tab in the admin no longer requires a hard refresh

## 2017-11-22

### Fixed
- When saving a phase in the admin, the spinner stops on success or errors
- Deleting a user no longer breaks the idea listing, idea page and comments
- Better error handling in the signup flow
- Various bug fixes to the projects admin
- The switches that control age, gender, ... now have an effect on the signup flow.
- For new visitors, hard reloading will no longer be required

### Added
- Social Sign In with facebook and google. (Needs to be setup individually per customer)
- Information pages are reachable through the navbar and editable through the admin
- A partner API that allows our partners to list ideas and projects programmatically
- Ideas with a location show a map on the idea show page
- Activation of welcome and reset password e-mails

### Changed
- Changes to mobile menu layout
- Changes to the style of switches
- Better overall mobile experience for citizen-facing site

### Known issues
- If you visited the site before and the page did not load, you need to hard refresh.
- If the "Customize" tab in the admin settings does not load, reload the browser on that page


## 2017-11-01

### Fixed

- Various copy added to the translation system
- Fixed bug where image was not shown after posting an idea
- Loading behaviour of the information pages
- Fixed bug where the app no longer worked after visiting some projects
### Added
- Added groups to the admin
- Added permissions to projects
- Social sharing of ideas on twitter and (if configured for the platform) facebook
- Projects can be linked to certain areas in the admin
- Projects can be filtered by area on the projects page
- Backend events are logged to segment

### Changed
- Improved the styling of the filters 
- Project description in the admin has its own tab
- Restored the landing page header with an image and configurable text 
- Improved responsiveness for idea show page
- Maximum allowed password length has increased to 72 characters
- Newest projects are list first

## 2017-10-09

### Fixed
- The male/female gender selection is no longer reversed after registration
- On firefox, the initial loading animation is properly scaled
- After signing in, the state of the vote buttons on idea cards is now correct for the current user
- Fixed bug were some text would disappear, because it was not available in the current language
- Fixed bug where adding an idea failed because of a wrongly stored user language
- Fixed bug where removing a language in the admin settings fails
- Graphical glitches on the project pages

### Added
- End-to-end test coverage for the happy flow of most of the citizen-facing app interaction
- Automated browser error logging to be proactive on bugs
- An idea can be removed through the admin

### Changed
- The modal that shows an idea is now fullscreen and has a new animation
- New design for the idea show page
- New design for the comments, with animation and better error handling
- The "Trending" sorting algorithm has changed to be more balanced and give new ideas a better chance
- Slightly improved design of the page that shows the user profile

## 2017-09-22

### Fixed
- Bug where multiple form inputs didn't accept typed input
- Issues blocking the login process
- The success message when commenting no longer blocks you from adding another comment
- Clicking an internal link from the idea modal didn't work
- Responsiveness of filters on the ideas page
- Updating an idea status through the admin failed

### Added
- Initial loading animation on page load
- Initial version of the legal pages (T&C, privacy policy, cookie policy)
- All forms give more detailed error information when something goes wrong
- Full caching and significant speed improvements for all data resources

### Changed
- Refactoring and restyling of the landing page, idea cards and project cards
- Added separate sign in and sign up components
- Cleaned up old and unused code
- The navbar is no longer shown when opening a modal
- Lots of little tweaks to styling, UX and responsiveness


## 2017-09-01

### Fixed
- Saving forms in the admin of Projects will now show success or error messages appropriately
- The link to the guide has been hidden from the admin sidebar until we have a guide to link to

### Added
- Adding an idea from a project page will pre-fill parts of the new idea form
- The landing page now prompts user to add an Idea if there are none
- The landing page will hide the Projects block if there are none

### Changed
- Under-the-hood optimizations to increase the loading speed of the platform

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
