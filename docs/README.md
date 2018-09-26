# Changelog

## 2018-09-26

### Fixed
- Error messages are no longer cut off when they are longer than the red box
- The timeline dropdown on mobile shows the correct phase names again
- Adding an idea by clicking on the map works again
- Filip peeters is no longer sending out spam reports
- Reordering projects on the projects admin no longer behaves unexpectedly
- Fixes to the idea manager
  - Tabs on the left no longer overlap the idea table
  - Idea status tooltips no longer have an arrow that points too much to the right
  - When the screen in not wide enough, the preview panel on the right is no longer shown
  - Changing an idea status through the idea manager is possible again

### Added
- Social sharing modal is now shown after posting an idea
  - Feature flagged as `ideaflow_social_sharing`
  - Offers sharing buttons for facebook, twitter and email
- File attachments can now be added to
  - Ideas, shown on the idea page. Also works for citizens.
  - Projects, shown in the information page, for admins and moderators
  - Phases, shown under the phase description under the timeline, for admins and moderators
  - Events, shown under the event description, for admins and moderators
  - Pages, shown under the text, for admins
- Some limited rich text options can now be used in email invitation texts

### Changed
- The admin projects page now shows 3 seperate sections for published, draft and archived
- When there are no voting buttons, comment icon and count are now also aligned to the right
- It's now possible to remove your avatar

## 2018-09-07

### Fixed
- Submit idea button is now aligned with idea form
- An error caused by social sign in on French platforms not longer has an English error message
- Checkboxes are now keyboard navigable
- Projects that currently don't accept ideas can no longer be selected when posting an idea
- Deleting an idea no longer results in a blank page
- Deleting a comment no longer results in a blank page
- When sign in fails, the error message no longer says the user doesn't exist
- `null` is no longer shown as a lastname for migrated cl1 users without last name
- Clicking on the table headers in the idea managers again swaps the sorting order as expected
- Typeform Survey now is properly usable on mobile
### Added

- Email notification control
  - Every user can opt-out from all recurring types of e-mails sent out by the platform by editing their profile
  - Emails can be fully disabled per type and per tenant (through S&S ticket)
- An widget that shows platform ideas can now be embedded on external sites
  - The style and content of the widget can be configured through admin > settings > widgets
  - Widget functionality is feature flagged as "widgets", on by default

### Changed
- Initial loading speed of the platform has drastically improved, particulary noticable on mobile
- New tenants have custom signup fields and survey feature enabled by default

## 2018-08-20

### Fixed
- The idea sidepane on the map correctly displays HTML again
- Editing your own comment no longer turns the screen blank
- Page tracking to segment no longer tracks the previous page instead of the current one
- Some browsers no longer break because of missing internationalization support
- The options of a custom field are now shown in the correct order

### Added
- A major overhaul of all citizen-facing pages to have significantly better accessibility (almost WCAG2 Level A compliant)
  - Keyboard navigation supported everywhere
  - Forms and images will work better with screen readers
  - Color constrasts have been increased throughout
  - A warning is shown when the color in admin settings is too low on constrast
  - And a lot of very small changes to increase WCAG2 compliance
- Archived projects are visible by citizens
  - Citizens can filter to see all, active or archived projects
  - Projects and project cards show a badge indicating a project is archived
  - In the admin, active and archived projects are shown separately
- A favicon can now be configured at the hidden location `/admin/favicon`
  - On android in Chrome, the platform can be added to the Android homescreen and will use the favicon as an icon
- Visitors coming through Onze Stad App now are trackable in analytics

### Changed
- All dropdown menus now have the same style
- The style of all form select fields has changed
- Page tracking to segment no longer includes the url as the `name` property (salesmachine)
- Font sizes throughout the citizen-facing side are more consistent

## 2018-08-03

### Fixed
- The landingpage header layout is no longer broken on mobile devices 
- Yet another bug related to the landingpage not correctly redirecting the user to the correct locale
- The Page not found page was not found when a page was not found

### Added
- The 'Create an account' call to action button on the landing page now gets tracked

## 2018-08-02

### Fixed
- The browser no longer goes blank when editing a comment
- Redirect to the correct locale in the URL no longer goes incorrectly to `en`

## 2018-07-31

### Fixed
- The locale in the URL no longer gets added twice in certain conditions
- Various fixes to the rich text editor
  - The controls are now translated
  - Line breaks in the editor and the resulting page are now consistent
  - The editor no longer breaks form keyboard accessibility
  - The images can no longer have inconsistent widht/height ratio wich used to happen in some cases
  - The toolbar buttons have a label for accessibility
- A new tenant created in French no longer contains some untranslated content
- The tenant lifecycle stage is now properly included in `group()` calls to segment
- Comment body and various dynamic titles are secured against XSS attacks

### Added
- Ideas published on CitizenLab can now also be pushed to Onze Stad App news stream
- The rich text editor
  - Now support copy/paste of images
- Event descriptions now also support rich text
- When not signed in, the header shows a CTA to create an account
- A new smart group rule allows you to specify members than have participated (vote, comment, idea) in a certain project
- The admin now shows a "Get started" link to the knowledge base on the bottom left
- The Dutch platforms show a "fake door" to Agenda Setting in the admin navigation

### Changed
- The idea card now shows name and date on 2 lines
- The navbar now shows the user name next to the avatar
- The user menu now shows "My ideas" instead of "Profile page"

## 2018-07-12

### Fixed
- New text editor fixes various bugs present in old editor:
  - Typing idea texts on Android phones now works as expected
  - Adding a link to a text field now opens the link in a new window
  - Resizing images now works as expected
  - When saving, the editor no longer causes extra whitespace to appear
- A (too) long list of IE11 fixes: The platform is now fully usable on IE11
- The group count in the smart groups now always shows the correct number
- The admin dashboard is no longer too wide on smaller screens
- The home button on mobile is no longer always active
- Fix for page crash when trying to navigate away from 2nd signup step when one or more required fields are present

### Added
- The language is now shown in the URL at all times (e.g. `/en/ideas`)
- The new text editor enables following extras:
  - It's now possible to upload images through the text editor
  - It's now possible to add youtube videos through the text editor
- `recruiter` has been added to the UTM campaign parameters

### Know issues
- The controls of the text editor are not yet translated
- Posting images through a URL in the text editor is no longer possible
- Images that have been resized by IE11 in the text editor, can subsequently no longer be resized by other browsers

## 2018-06-29

### Fixed
- Facebook now correctly shows the idea image on the very first share
- Signing up with a google account that has no avatar configured now works again
- Listing the projects and ideas for projects that have more than 1 group linked to them now works again

### Added
- Voting Insights [beta]: Get inisghts into who's voting for which content
  - Feature flagged as 'clustering', disabled by default
  - Admin dashboard shows a link to the prototype
- Social sharing buttons on the project info page
- Usage of `utm_` parameters on social sharing to track sharing performance
- Various improvements to meta tags throughout the platform
  - Page title shows the unread notification count
  - More descriptive page titles on home/projects/ideas
  - Engaging generic default texts when no meta title/description are provided
  - Search engines now understand what language and region the platform is targeting
- Optimized idea image size for facebook sharing
- Sharing button for facebook messenger on mobile
- When you receive admin rights, a notification is shown
- `tenantLifecycleStage` property is now present in all tracked events to segment

### Changed
 - Meta tags can't be changed through the admin panel anymore
 - Social sharing buttons changed aspect to be more visible

## 2018-06-20

### Fixed
- Visual fixes for IE11 (more to come)
  - The text on the homepage doesn't fall outside the text box anymore
  - The buttons on the project page are now in the right place
  - In the projects pages, the footer is no longer behaving like a header
- When trying to add a timeline phase that overlaps with another phase, a more descriptive error is shown
- Visuelt font is now always being loaded

### Added
- Smart groups allow admins to automatically and continuously make users part of groups based on conditions
- New user manager allows
  - Navigating through users by group
  - Moving, adding and removing users from/to (manual) groups
  - Editing the group details from within the user manager
  - Creating groups from within the user manager
  - Exporting users to excel by group or by selection
- Custom registration fields now support the new type "number"
- The city website url can now be specified in admin settings, which is used as a link in the footer logo

### Changed
- The checkbox copy at signup has changed and now links to both privacy policy and terms and conditions
- Improved styling of usermenu dropdown (the menu that opens when you click on the avatar in the navigation bar)

### Removed
- The groups page is no longer a separate page, but the functionality is part of the user manager

## 2018-06-11

### Fixed
- Notifications that indicate a status change now show the correct status name
- The admin pages editors support changing content and creating new pages again
- When searching in the invites, filters still work as expected
- The font has changed again to Visuelt

### Added
- Accessibility improvements:
  - All images have an 'alt' attributes
  - The whole navbar is now usable with a keyboard
  - Modals can be closed with the escape key
  - The contrast of labels on white backgrounds has increased
- New ideas will now immediately be scraped by facebook
- When inviting a user, you can now pick projects for which the user becomes a moderator

### Changed
- The language switcher is now shown on the top right in the navbar

## 2018-05-27

### Fixed
- Sitemap now has the correct date format
- Empty invitation rows are no longer created when the given excel file contains empty rows
- Hitting enter while editing a project no longer triggers the delete button
- Registration fields on signup and profile editing are now always shown in the correct language
- The dropdown menu for idea sorting no longer gets cut off by the edge of the screen on small screens
- Saving a phase or continuous project no longer fails when participation method is not ideation
### Added
- Language selection now also has a regional component (e.g. Dutch (Belgium) instead of Dutch)
- Added noindex tag on pages that should be shown in Google
- A new 'user created' event is now being tracked from the frontend side
- It's now possible to use HTML in the field description of custom fields (no editor, only for internal usage)

## 2018-05-16

### Fixed
- Phases are now correctly active during the day specified in their end date
- On the new idea page, the continue button is now shown at all resolutions
- On the idea list the order-by dropdown is now correctly displayed at all resolutions.

### Added
- Project moderators can be specified in project permissions, giving them admin and moderation capabilities within that project only
   - Moderators can access all admin settings of their projects
   - Moderators can see they are moderating certain projects through icons
   - Moderators can edit/delete ideas and delete comments in their projects
- A correct meta description tag for SEO is now rendered
- The platforms now render sitemaps at sitemap.xml
- It is now possible to define the default view (map/cards) for every phase individually
- The tenant can now be configured with an extra `lifecycle_stage` property, visible in Admin HQ.
- Downloading ideas and comments xlsx from admin is now tracked with events
- The fragment system, to experiment with custom content per tenant, now also covers custom project descriptions, pages and individual ideas

### Changed
- It is no longer possible to define phases with overlapping dates
- Initial loading speed of the platform has improved

## 2018-04-30

### Fixed
- When posting an idea and only afterward signing in, the content originally typed is no longer lost
- An error is no longer shown on the homepage when using Internet Explorer
- Deleting a user is possible again

### Changed
- The idea manager again shows 10 ideas on one page, instead of 5
- Submit buttons in the admin no longer show 'Error' on the buttons themselves

### Removed
- The project an idea belongs to can no longer be changed through the edit idea form, only through the idea manager

## 2018-04-26

### Added
- Areas can now be created, edited and deleted in the admin settings
- The order of projects can now be changed through drag&drop in the admin projects overview
- Before signing up, the user is requested to accept the terms and conditions
- It's possible to experiment with platform-specific content on the landing page footer, currently through setup & support
- Images are only loaded when they appear on screen, improving page loading speed

### Fixed
- You can no longer click a disabled "add an idea" button on the timeline
- When accessing a removed idea or project, a message is shown

### Known issues
- Posting an idea before logging in is currently broken; the user is redirected to an empty posting form
- Social sharing is not consistently showing all metadata

## 2018-04-18

### Fixed
- Adding an idea at a specific location by clicking on the map is fixed

## 2018-04-09

### Fixed
- An idea with a location now centers on that location
- Map markers far west or east (e.g. Vancouver) are now positioned as expected
- Links in comment now correctly break to a new line when they're too long
- Hitting enter in the idea search box no longer reloads the page
- A survey project no longer shows the amount of ideas on the project card
- The navbar no longer shows empty space above it on mobile
- The report as spam window no longer scrolls in a weird way
- The project listing on the homepage no longer repeats the same project for some non-admin users
- Google/Facebook login errors are captured and shown on an error page
- Some rendering issues were fixed for IE11 and Edge, some remain
- An idea body with very long words no longer overlaps the controls on the right
- Project cards no longer overlap the notification menu

### Added
- A user can now edit and delete its own comments
- An admin can now delete a user's comment and specify the reason, notifying the user by notification
- Invitations
  - Admins can invite users by specifying comma separated email addresses
  - Admins can invite users with extra information by uploading an excel file
  - Invited users can be placed in groups, made admin, and given a specific language
  - Admins can specify a message that will be included in the email to the invited users
  - Admins receive a notification when invited users sign up
- Users receive a notification and email when their idea changes status
- Idea titles are now limited to 80 characters

### Known issues
- Adding an idea through the map does not position it correctly

## 2018-03-23

### Fixed
- Fixed padding being added on top of navigation bar on mobile devices

## 2018-03-22

### Fixed
- Idea creation page would not load when no published projects where present. Instead of the loading indicator the page now shows a message telling the user there are no projects.

## 2018-03-20

### Fixed
- Various visual glitches on IE11 and Edge
- Scrolling behviour on mobile devices is back to normal
- The admin idea manager no longer shows an empty right column by default

### Added
- Experimental raw HTML editing for pages in the admin at `/admin/pages`

## 2018-03-14

### Fixed
- When making a registration field required, the user can't skip the second sign up step
- When adding a registration field of the "date" type, a date in the past can now be chosen
- The project listing on the landing page for logged in users that aren't admin is fixed

### Added
- When something goes wrong while authenticating through social networks, an error page is shown

## 2018-03-05

### Added
- Limited voting in timeline phases
- Facebook app id is included in the meta headers

### Known issues
- When hitting your maimum vote count as a citizen, other idea cards are not properly updating untill you try voting on them
- Changing the participation settings on a continuous project is impossible


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
