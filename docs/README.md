# Changelog

## 2021-02-12

### Fixed

- Fixed Azure AD login for some Azure setups (Schagen)

### Changed
- When searching for an idea, the search operation no longer searches on the author's name. This was causing severe performance issues and slowness of the paltforms.

## 2021-02-10

### Added
- Automatic tagging

## 2021-02-08

### Fixed
- Fixed a bug preventing registration fields and poll questions from reordering correctly.
- Fixed a bug causing errors in new platforms.

## 2021-02-04
### Fixed
- Fixed a bug causing the projects list in the navbar and projects page to display projects outside of folders when they're contained within them.

## 2021-01-29

### Added
- Ability to redirect URLs through AdminHQ
- Accessibility statement link in the footer

### Fixed
- Fixed issue affecting project managers that blocked access to their managed projects, when these are placed inside a folder.

## 2021-01-28

### Fixed
- A bug in Admin project edit page that did not allow a user to Go Back to the projects list after switching tabs
- Scrolling on the admin users page

## 2021-01-26

### Added
- Folder admin rights. Folder admins or 'managers' can be assigned per folder. They can create projects inside folders they have rights for, and moderate/change the folder and all projects that are inside.
- The 'from' and 'reply-to' emails can be customized by cluster (by our developers, not in Admin HQ). E.g. Benelux notification emails could be sent out by notifications@citizenlab.eu, US emails could be sent out by notifications@citizenlab.us etc., as long as those emails are owned by us. We can choose any email for "reply-to", so also email addresses we don't own. This means "reply-to" could potentially be configured to be an email address of the city, e.g. support@leuven.be. It is currently not possible to customize the reply-to (except for manual campaigns) and from fields for individual tenants.
- When a survey requires the user to be signed-in, we now show the sign in/up form directly on the page when not logged in (instead of the green infobox with a link to the sign-up popup)

### Fixed
- The 'reply-to' field of our emails showed up twice in recipient's email clients, now only once.

### Changed
- Added the recipient first and last name to the 'to' email field in their email client, so not only their email adress is shown.
- The links in the footer can now expand to multiple lines, and therefore accomodate more items (e.g. soon the addition of a link to the accesibility statement)

## 2021-01-21

### Added
- Added right-to-left rendering to emails

## 2021-01-18

### Fixed
- Access rights tab for participatory budget projects
- Admin moderation page access

## 2021-01-15

### Changed
- Copy improvements across different languages

## 2021-01-14

### Added
- Ability to customize the input term for a project

### Changed
- The word 'idea' was removed from as many places as possible from the platform, replaced with more generic copy.

## 2021-01-13

### Changed
- Idea cards redesign
- Project folder page redesign
- Project folders now have a single folder card image instead of 5 folder images in the admin settings
- By default 24 instead of 12 ideas or shown now on the project page

## 2020-12-17

### Fixed
- When creating a project from a template, only templates that are supported by the tenant's locale will show up
- Fixed several layout, interaction and data issues in the manual tagging feature of the Admin Processing page, making it ready for external use.
- Fixed project managers access of the Admin Processing page.

### Added
- Admin activity feed access for project managers
- Added empty state to processing list when no project is selected
- Keyboard shortcut tooltip for navigation buttons of the Admin Processing page

### Changed
- Reduced spacing in sidebar menu, allowing for more items to be displayed
- Style changes on the Admin Processing page

## 2020-12-08

### Fixed
- Issues with password reset and invitation emails
- No more idea duplicates showing up on idea overview pages
- Images no longer disappear from a body of an idea, or description of a project on phase, if placed at the bottom.

### Changed
- Increased color contrast of inactive timeline phases text to meet accesibility standard
- Increased color contrast of event card left-hand event dates to meet accesibility standard
- Increased color contrast of List/Map toggle component to meet accesibility standard

### Added
- Ability to tag ideas manually and automatically in the admin.

## 2020-12-02

### Changed
- By default the last active phase instead of the last phase is now selected when a timeline project has no active phase

### Fixed
- The empty white popup box won't pop up anymore after clicking the map view in non-ideation phases.
- Styling mistakes in the idea page voting and participatory budget boxes.
- The tooltip shown when hovering over a disabled idea posting button in the project page sticky top bar is no longer partially hidden

## 2020-12-01

### Changed
- Ideas are now still editable when idea posting is disabled for a project.

## 2020-11-30

### Added
- Ability to create new and edit existing idea statuses

### Fixed
- The page no longer refreshes when accepting the cookie policy

### Changed
- Segment is no longer used to connect other tools, instead following tools are integrated natively
  - Google Analytics
  - Google Tag Manager
  - Intercom
  - Satismeter
  - Segment, disabled by default
- Error messages for invitations, logins and password resets are now clearer.

## 2020-11-27

### Fixed

- Social authentication with Google when the user has no avatar.

### Changed

- Random user demographics on project copy.

## 2020-11-26

### Added
- Some specific copy for Vitry-sur-Seine

## 2020-11-25

### Fixed
- Sections with extra padding or funky widths in Admin were returned to normal
- Added missing copy from previous release
- Copy improvements in French

### Changed
- Proposal and idea descriptions now require 30 characters instead of the previous 500

## 2020-11-23

### Added
- Some specific copy for Sterling Council

### Fixed
- The Admin UI is no longer exposed to regular (and unauthenticated) users
- Clicking the toggle button of a custom registration field (in Admin > Settings > Registration fields) no longer duplicated the row
- Buttons added in the WYSIWYG editor now have the correct color when hovered
- The cookie policy and accessibility statement are not editable anymore from Admin > Settings > Pages

### Changed

**Project page:**

- Show all events at bottom of page instead of only upcoming events
- Reduced padding of sticky top bar
- Only show sticky top bar when an action button (e.g. 'Post an idea') is present, and you've scrolled past it.

**Project page right-hand sidebar:**

- Show 'See the ideas' button when the project has ended and the last phase was an ideation phase
- Show 'X ideas in the final phase' when the project has ended and the last phase was an ideation phase
- 'X phases' is now clickable and scrolls to the timeline when clicked
- 'X upcoming events' changed to 'X events', and event count now counts all events, not only upcoming events

**Admin project configuration page:**

- Replaced 'Project images' upload widget in back-office (Project > General) with 'Project card image', reduced the max count from 5 to 1 and updated the corresponding tooltip with new recommended image dimensions

**Idea page:**

- The map modal now shows address on top of the map when opened
- Share button copy change from "share idea" to "share"
- Right-hand sidebar is sticky now when its height allows it (= when the viewport is taller than the sidebar)
- Comment box now has an animation when it expands
- Adjusted scroll-to position when pressing 'Add a comment' to make sure the comment box is always fully visible in the viewport.

**Other:**

- Adjusted FileDisplay (downloadable files for a project or idea) link style to show underline by default, and increased contrast of hover color
- Reduced width of DateTimePicker, and always show arrows for time input

## 2020-11-20 (2)

### Fixed
- The project header image is screen reader friendly.
- The similar ideas feature doesn't make backend requests anymore when it's not enabled.

### Changed
- Areas are requested with a max. of 500 now, so more areas are visible in e.g. the admin dashboard.

## 2020-11-18

### Added
- Archived project folder cards on the homepage will now have an "Archived" label, the same way archived projects do\
- Improved support for right-to-left layout
- Experimental processing feature that allows admins and project managers to automatically assign tags to a set of ideas.

### Fixed
- Projects without idea sorting methods are no longer invalid.
- Surveys tab now shows for projects with survey phases.

### Changed
- Moved welcome email from cl2-emails to cl2-back

## 2020-11-16

### Added
- Admins can now select the default sort order for ideas in ideation and participatory budgeting projects, per project

### Changed
- The default sort order of ideas is now "Trending" instead of "Random" for every project if left unchanged
- Improved sign in/up loading speed
- Removed link to survey in the project page sidebar when not logged in. Instead it will show plain none-clickable text (e.g. '1 survey')

### Fixed
- Custom project slugs can now contain alphanumeric Arabic characters
- Project Topics table now updates if a topic is deleted or reordered.
- Empty lines with formatting (like bold or italic) in a Quill editor are now removed if not used as paragraphs.

## 2020-11-10

### Added

#### Integration of trial management into AdminHQ
- The lifecycle of the trials created from AdminHQ and from the website has been unified.
- After 14 days, a trial platform goes to Purgatory (`expired_trial`) and is no longer accessible. Fourteen days later, the expired trial will be removed altogether (at this point, there is no way back).
- The end date of a trial can be modified in AdminHQ (> Edit tenant > Internal tab).

## 2020-11-06

### Added
- Social sharing via WhatsApp
- Ability to edit the project URL
- Fragment to embed a form directly into the new proposal page, for regular users only

### Fixed
- The project about section is visibile in mobile view again
- Maps will no longer overflow on page resizes

## 2020-11-05

### Added
- Reordering of and cleaner interface for managing custom registration field options
- An 'add proposal' button in the proposals admin
- Fragment to user profile page to manage party membership settings (CD&V)
- "User not found" message when visiting a profile for a user that was deleted or could not be found

### Changed
- Proposal title max. length error message
- Moved delete functionality for projects and project folders to the admin overview

### Fixed
- The automatic scroll to the survey on survey project page

## 2020-11-03

### Fixed
- Fixed broken date picker for phase start and end date

## 2020-10-30

### Added

- Initial Right to left layout for Arabic language
- Idea description WYSIWYG editor now supports adding images and/or buttons

## 2020-10-27

### Added

- Support for Arabic

## 2020-10-22

### Added
- Project edit button on project page for admins/project manager
- Copy for Sterling Council

### Fixed
- Links will open in a new tab or stay on the same page depending on their context. Links to places on the platform will open on the same page, unless it breaks the flow (i.e. going to the T&C policy while signing up). Otherwise, they will open in a new tab.

### Changed
- In the project management rights no ambiguous 'no options' message will be shown anymore when you place your cursor in the search field

## 2020-10-16

### Added
- Ability to reorder geographic areas

### Fixed
- Stretched images in 'avatar bubbles'
- Input fields where other people can be @mentioned don't grow too wide anymore
- Linebar charts overlapping elements in the admin dashboard

## 2020-10-14

### Changed
- Project page redesign

## 2020-10-09

### Added
- Map configuration tool in AdminHQ (to configure maps and layers at the project level).

## 2020-10-08

### Added
- Project reports

### Changed
- Small styling fixes
- Smart group support multiple area codes
- Layout refinements for the new idea page
- More compact idea/proposal comment input
- Proposal 'how does it work' redesign

## 2020-10-01

### Changed
- Idea page redesign

## 2020-09-25

### Fixed
- The "Go to platform" button in custom email campaigns now works in Norwegian

### Added
- Granular permissions for proposals
- Possibility to restrict survey access to registered users only
- Logging project published events

### Changed
- Replaced `posting_enabled` in the proposal settings by the posting proposal granular permission
- Granular permissions are always granted to admins

## 2020-09-22

### Added
- Accessibility statement

## 2020-09-17

### Added
- Support for checkbox, number and (free) text values when initializing custom fields through excel invites.

### Changed
- Copy update for German, Romanian, Spanish (CL), and French (BE).

## 2020-09-15

### Added
- Support Enalyzer as a new survey provider
- Registration fields can now be hidden, meaning the user can't see or change them, typically controlled by an outside integration. They can still be used in smart groups.
- Registration fields can now be pre-populated using the invites excel

## 2020-09-08

### Fixed
- Custom buttons (e.g. in project descriptions) have correct styling in Safari.
- Horizontal bar chart overflow in Admin > Dashboard > Users tab
- User graphs for registration fields that are not used are not shown anymore in Admin > Dashboard > Users tab

### Added
- Pricing plan feature flags for smart groups and project access rights

## 2020-09-01

### Fixed
- IE11 no longer gives an error on places that use the intersection observer: project cards, most images, ...

### Added

- New platform setting: 'Abbreviated user names'. When enabled, user names are shown on the platform as first name + initial of last name (Jane D. instead of Jane Doe). This setting is intended for new platforms only. Once this options has been enabled, you MUST NOT change it back.
- You can now export all charts in the admin dashboard as xlsx or svg.
- Translation improvements (email nl...)

### Changed
- The about us (CitizenLab) section has been removed from the cookie policy

## 2020-08-27

### Added

- Support for rich text in field descriptions in the idea form.
- New "Proposed Budget" field in the idea form.

### Changed

- Passwords are checked against a list of common passwords before validation.
- Improving the security around xlsx exports (escaping formulas, enforcing access restrictions, etc.)
- Adding request throttling (rate-limiting) rules.
- Improving the consistency of the focus style.

## 2020-07-30

### Added
- Pricing plans in AdminHQ (Pricing plan limitations are not enforced).
- Showing the number of deviations from the pricing plan defaults in the tenant listing of AdminHQ.

### Changed
- Tidying up the form for creating new tenants in AdminHQ (removing unused features, adding titles and descriptions, reordering features, adding new feature flags, removing fields for non-relevant locales).

## 2020-07-10

### Added
- Project topics

### Changed
- Userid instead of email is used for hidden field in surveys (Leiden)
- New projects have 'draft' status by default

### Fixed
- Topics filter in ideas overview works again

## 2020-07-09 - Workshops

### Fixed
- Speps are scrollable

### Added
- Ability to export the inputs as an exel sheet
- Polish translations
- Portugese (pt-BR) translations

## 2020-06-26

### Fixed
- No longer possible to invite a project manager without selecting a project
- The button on the homepage now also respects the 'disable posting' setting in proposals
- Using project copy or a tenant template that contains a draft initiative no longer fails

### Added
- Romanian

## 2020-06-19

### Fixed
- Polish characters not being rendered correctly

### Added
- Back-office toggle to turn on/off the ability to add new proposals to the platform

## 2020-06-17

### Fixed
- It's no longer needed to manually refresh after deleting your account for a consistent UI
- It's no longer needed to manually refresh after using the admin toggle in the user overview
- The sign-in/up flow now correctly asks the user to verify if the smart group has other rules besides verification
-


demo` is no longer an available option for `organization_type` in admin HQ
- An error is shown when saving a typeform URL with `?email=xxxx` in the URL, which prevented emails to be linked to survey results
- On mobile, the info container in the proposal info page now has the right width
- A general issue with storing cookies if fixed, noticable by missing data in GA, Intercom not showing and the cookie consent repeatedly appearing
- Accessibility fix for the search field
- The `signup_helper_text` setting in admin HQ is again displayed in step 1 of the sign up flow
### Added
- There's a new field in admin HQ to configure custom copy in step 2 of the sign up flow called `custom_fields_signup_helper_text`
- `workshops` can be turned on/off in admin HQ, displayed as a new page in the admin interface

### Changed
- The copy for `project moderator` has changed to `project manager` everywhere
- The info image in the proposals header has changed

## 2020-06-03

### Fixed

- Maps with markers don't lose their center/zoom settings anymore
- English placeholders in idea form are gone for Spanish platforms

## 2020-05-26

### Changed
- Lots of small UI improvements throughout the platform
- Completely overhauled sign up/in flow:
  - Improved UI
  - Opens in a modal on top of existing page
  - Opens when an unauthenticaed user tries to perform an action that requires authentication (e.g. voting)
  - Automatically executes certain actions (e.g. voting) after the sign in/up flow has been completed (note: does not work for social sign-on, only email/password sign-on)
  - Includes a verification step in the sign up flow when the action requires it (e.g. voting is only allowed for verified users)

## 2020-05-20

### Fixed

- Budget field is shown again in idea form for participatory budget projects

## 2020-05-14

### Added

- Idea configurability: disabling/requiring certain fields in the idea form
- The footer has our new logo

### Changed

- Admins will receive a warning and need to confirm before sending a custom email to all users
- A survey project link in the top navigation will link to /info instead of to /survey

## 2020-04-29

### Fixed

- Folders are again shown in the navbar
- Adding an image to the description text now works when creating a project or a phase

### Added

- Support for Polish, Hungarian and Greenlandic

## 2020-04-23

### Fixed

- Long timeline phase names show properly

### Changed

- Redirect to project settings after creating the project
- Links to projects in the navigation menu link to the timeline for timeline projects

## 2020-04-21

### Fixed

- Fixed overlapping issue with idea vote bar on mobile
- Fixed an issue where images were used for which the filename contained special characters

### Added

- The overview (moderation) in the admin now has filters
  - Seen/not seen
  - Type: Comment/Idea/Proposal
  - Project
  - Search
- The idea xlsx export contains extra columns on location, number of comments and number of attachments

### Changed

- The permissions tab in the project settings has reordered content, to be more logical
- In German, the formal 'Sie' form has been replaced with the informal 'Du' form

## 2020-03-31

### Fixed

- Signing up with keyboard keys (Firefox)
- Composing manual emails with text images
- Exporting sheet of volunteers with long cause titles

### Added

- Folder attachments
- Publication status for folders

### Changed

- Show folder projects within admin project page

## 2020-03-20

### Added

- Volunteering as a new participation method

## 2020-03-16

### Fixed

- The project templates in the admin load again

## 2020-03-13

### Fixed

- The folder header image is not overly compressed when making changes to the folder settings
- The loading spinner on the idea page is centered

### Added

- Add images to folders, shown in cards.

### Changed

- Admins can now comment on ideas.

## 2020-03-10

### Fixed

- Fixed consent banner popping up every time you log in as admin
- Fixed back-office initiative status change 'Use latest official updates' radio button not working
- Fixed broken copy in Initiative page right-hand widget

### Added

- Add tooltip explaining what the city will do when the voting threshold is reached for a successful initiative
- Added verification step to the signup flow
- New continuous flow from vote button clicked to vote casted for unauthenticated, unverified users (click vote button -> account creation -> verification -> optional/required custom signup fields -> programmatically cast vote -> successfully voted message appears)
- The rich text editor in the admin now supports buttons

### Changed

- Admin HQ: new and improved list of timezones

## 2020-03-05

### Fixed

- Signup step 2 can no longer be skipped when there are required fields
- Correct tooltip link for support article on invitations
- Correct error messages when not filling in start/end date of a phase

### Added

- Setting to disable downvoting in a phase/project, feature flagged
- When a non-logged in visitor tries to vote on an idea that requires verification, the verification modal automatically appears after registering

## 2020-02-24

### Fixed

- Initiative image not found errors
- Templates generator out of disk space

### Added

- Folders i1
  - When enabled, an admin can create, edit, delete folders and move projects into and out of folders
  - Folders show in the project lists and can be ordered within projects

### Changed

- Initiative explanatory texts show on mobile views
- Existing platforms have a moderator@citizenlab.co admin user with a strong password in LastPass
- In the admin section, projects are no longer presented by publication status (Folders i1)

## 2020-02-19

### Fixed

- Loading more comments on the user profile page works again
- Accessibility improvements
- Adding an image no longer pops up the file dialog twice
- Changed to dedicated IP in mailgun to improve general deliverability of emails

### Added

- Improvements to the PB UI to make sure users confirm their basket at the end
- Ideation configurability i1
  - The idea form can be customized, on a project level, to display custom description texts for every field
- People filling out a poll are now included in the 'participated in' smart group rules
- Make me admin section in Admin HQ

### Changed

- When a platform no longer is available at a url, the application redirects to the CitizenLab website
- New platforms automatically get a moderator@citizenlab.co admin user with a strong password in LastPass

## 2020-01-29

### Fixed

- Rich text editor no longer allows non-video iframe content
- Smart groups that refer to a deleted project now get cleaned up when deleting a project
- All cookie consent buttons are now reachable on IE11
- More accessibility fixes
- The organization name is no longer missing in the password reset email

### Added

- CSAM verification
  - Users can authenticate and verify using BeID or itsme
  - User properties controlled by a verification method are locked in the user profile
  - Base layer of support for other similar verification methods in the future
- The order of project templates can now be changed in Templates HQ

### Changed

- Project templates overview no longer shows the filters

## 2020-01-17

### Fixed

- Further accesibility improvements:
  - Screen reader improvement for translations
  - Some color contrast improvements

### Added

- A hidden topics manager available at https://myfavouriteplatform.citizenlab.co/admin/topics

## 2020-01-15

### Fixed

- In the admin, the project title is now always displayed when editing a project
- Further accesibility improvements:
  - Site map improvements (navigation, clearer for screen readers)
  - Improved colors in several places for users with sight disability
  - Improved HTML to better inform screen reader users
  - Added keyboard functionality of password recovery
  - Improved forms (easier to use for users with motoric disabilities, better and more consistent validation, tips and tricks on mobile initiative form)
  - Improvements for screen reader in different languages (language picker, comment translations)
  - Added title (visible in your tab) for user settings page
  - Improved screen reader experience for comment posting, deleting, upvoting and idea voting

### Added

- The email notification settings on the user profile are now grouped in categories
- Unsubscribing through an email link now works without having to sign in first

### Changed

- The idea manager now shows all ideas by default, instead of filtered by the current user as assignee

## 2020-01-07

### Added

- Go to idea manager when clicking 'idea assigned to you' notification
- 2th iteration of the new admin moderation feature:
  - Not viewed/Viewed filtering
  - The ability to select one or more items and mark them as viewed/not viewed
  - 'Belongs to' table column, which shows the context that a piece of content belongs to (e.g. the idea and project that a comment belongs to)
  - 'Read more' expand mechanism for longer pieces of content
  - Language selector for multilingual content
  - 'Go to' link that will open a new tab and navigate you to the idea/iniative/comment that was posted

### Changed

- Improve layout (and more specifically width) of idea/iniatiatve forms on mobile
- Separate checkboxes for privacy policy and cookie policy
- Make the emails opt-in at registration

### Fixed

- Fix for unreadable password reset error message on Firefox
- Fix for project granular permission radio buttons not working

## 2019-12-12

### Added

- Polls now support questions for which a user can check multiple options, with a configurable maximum
- It's now possible to make a poll anonymous, which hides the user from the response excel export
- New verification method `id_card_lookup`, which supports the generic flow of verifying a user using a predined list of ID card numbers.
  - The copy can be configured in Admin HQ
  - The id cards CSV can be uploaded through Admin HQ

## 2019-12-11

### Added

- Admin moderation iteration 1 (feature flagged, turned on for a selected number of test clients)
- New verification onboarding campaign

### Changed

- Improved timeline composer
- Wysiwyg accessibility improvement

### Fixed

- English notifications when you have French as your language

## 2019-12-06

### Fixed

- Accessibility improvements:
  - Polls
  - Idea/initiative filter boxes
- Uploading a file in admin project page now shows the loading spinner when in progress
- Fixed English copy in notifications when other language selected
- Fixed project copy in Admin HQ not being saved

## 2019-12-05

### Fixed

- Small popups (popovers) no longer go off-screen on smaller screens
- Tooltips are no longer occluded by the checkbox in the idea manager
- The info icon on the initiatives voting box has improved alignment
- Project templates now display when there's only `en` is configured as a tenant locale
- When changing the lifecycle stage of a tenant, the update is now sent right away to segment
- When users accept an inivitation and are in a group, the group count is correctly updated
- Dropdowns in the registration flow can again support empty values
- Accessibility:
  - Various color changes to improve color contrasts
  - Color warning when picking too low contrast
  - Improvements to radio buttons, checkboxes, links and buttons for keyboard accessibility
  - Default built-in pages for new tenants have a better hierarchy for screen readers
- User posted an idea/initiative notification for admins will be in the correct language

## 2019-11-25

### Changed

- Updated translations
- Area filter not shown when no areas are configured
- Overall accessibility improvements for screen readers
- Improved accessibility of the select component, radio button, image upload and tooltip

### Fixed

- When adding a vote that triggers the voting limit on a project/phase, the other idea cards now automatically get updated with disabled vote buttons
- Fix for mobile bottom menu not being clickable when idea page was opened
- Navigating directly between projects via the menu no longer results in faulty idea card collections
- Display toggle (map or list view) of idea and initiative cards works again

## 2019-11-19

### Added

- New ideation project/phase setting called 'Idea location', which enables or disabled the ability to add a location to an idea and show the ideas on a map

### Changed

- Improved accessibility of the image upload component
- COW tooltipy copy
- Sharing modal layout improvement

### Fixed

- Checkboxes have unique ids to correctly identify their corresponding label, which improves screen reader friendliness when you have multiple checkboxes on one page.
- Avatar layout is back to the previous, smaller version

## 2019-11-15

### Fixed

- Fix for 'Click on map to add an idea' functionality not working
- Fix for notifications not showing

## 2019-11-12

### Fixed

- An email with subject `hihi` is no longer sent to admins that had their invite accepted
- Whe clicking the delete button in the file uploader, the page no longer refreshes
- Project templates no longer show with empty copy when the language is missing
- The countdown timer on initiatives now shows the correct value for days
- The radio buttons in the cookie manager are clickable again
- Changing the host of a tenant no longer breaks images embedded in texts
- It's possible again to unassign an idea in the idea manager
- The popup for adding a video or link URL is no longer invisible or unusable in some situations
- Uploading files is no longer failing for various filetypes we want to support
- Keyboard accessibility for modals

### Added

- ID Verification iteration 1
  - Users can verify their account by entering their ID card numbers (currently Chile only)
  - Verification is feature flagged and off by default
  - Smart groups can include the criterium 'is verified'
  - Users are prompted to verify their account when taking an actions that requires verification
- Total population for a tenant can now be entered in Admin HQ
- It's now possible to configure the word used for areas towards citizens from the areas admin
- Improvements to accessibility:
  - Idea and initiative forms: clearer for screen readers, keyboard accessibility, and more accessible input fields
  - Nav bar: clearer for screen readers and improved keyboard navigation
  - Project navigation and phases: clearer for screen readers
  - Sign-in, password reset and recovery pages: labeling of the input fields, clearer for screen readers
  - Participatory budgeting: clearer for screen readers

### Changed

- The organization name is now the default author in an official update

## 2019-10-22

### Fixed

- The sharing title on the idea page is now vertically aligned
- Improvements to the 'bad gateway' message sometimes affecting social sharing
- The map and markers are again visible in the admin dashboard
- First round of accessibility fixes and improvements
  - Dynamics of certain interactions are picked up by screen readers (PB, voting, ...)
  - Overall clarity for screen readers has improved
  - Improvements to information structure: HTML structure, W3C errors, head element with correct titles
  - Keyboard accessibility has generally improved: sign-up problems, login links, PB assignment, ...

### Added

- Initiatives iteration 3
  - Automatic status changes on threshold reached or time expired
  - When updating the status, official feedback needs to be provided simultaneously
  - Users receive emails and notifications related to (their) initiative
  - Initiatives support images in their body text
- Project templates
  - Admins can now create projects starting from a template
  - Templates contain images, a description and a timeline and let admin filter them by tags
  - Admins can share template descriptions with a publically accessible link
- It's now possible to configure the banner overlay color from the customize settings
- A custom email campaign now contains a CTA button by default

### Changed

- Complete copy overhaul of all emails

## 2019-10-03

### Fixed

- PB phase now has a basket button in the project navbar
- The datepicker in the timeline admin now works in IE11

### Changed

- For fragments (small pieces of UI that can be overridden per tenant) to work, they need to be enabled individually in admin HQ.

## 2019-09-25

### Fixed

- It's again possible to change a ideation/PB phase to something else when it contains no ideas
- Older browsers no longer crash when scrolling through comments (intersection observer error)
- Pagination controls are now correctly shown when there's multiple pages of users in the users manager
- The user count of groups in the users manager no longer includes invitees and matches the data shown
- Transition of timeline phases now happen at midnight, properly respecting the tenant timezone
- When looking at the map of an idea or initiative, the map marker is visible again
- The initiatives overview pages now uses the correct header and text colors
- The vote control on an initiative is no longer invisible on a tablet screen size
- The idea page in a budgeting context now shows the idea's budget
- The assign button on an idea card in a budgeting context behaves as expected when not logged in
- Project copy in Admin HQ that includes comments no longer fails
- Changing granular permissions by project moderator no longer fails

### Added

- Polling is now supported as a new participation method in a continuous project or a phase
  - A poll consists of multiple question with predefined answers
  - Users can only submit a poll once
  - Taking a poll can be restricted to certain groups, using granular permissions
  - The poll results can be exported to excel from the project settings
- It's now possible to disable Google Analytics, Google Tag Manager, Facebook Pixel and AdWords for specific tenants through Admin HQ

### Changed

- Large amount of copy improvements throughout to improve consistency and experience
- The ideas overview page is no longer enabled by default for new tenants
- The built-in 'Open idea project' can now be deleted in the project admin

## 2019-08-30

### Fixed

- The map preview box no longer overflows on mobile devices
- You're now correctly directed back to the idea/initiatives page after signing in/up through commenting

### Changed

- The height of the rich text editor is now limited to your screen height, to limit the scrolling when applying styles

## 2019-08-29

### Fixed

- Uploaded animated gifs are no longer displayed with weird artifacts
- Features that depend on NLP are less likely to be missing some parts of the data

### Added

- Citizen initiatives
  - Citizens can post view and post initiatives
  - Admins can manage initiatives, similar to how they manage ideas
  - Current limitation to be aware of, coming very soon:
    - No emails and notifications related to initiatives yet
    - No automated status changes when an initiative reaches enough votes or expires yet

## 2019-08-09

### Fixed

- Fixed a bug that sometimes prevented voting on comments
- When editing a comment, a mention in the comment no longer shows up as html
- In the dashboard, the domicile value 'outside' is now properly translated
- Some fixes were made to improve loading of the dashboard map with data edge cases
- Deleting a phase now still works when users that reveived notifications about the phase have deleted their account
- New releases should no longer require a hard refresh, avoiding landing page crashing issues we had

### Added

- File input on the idea form now works on mobile, if the device supports it

## 2019-07-26

### Fixed

- The project moderator email and notification now link to the admin idea manager instead of citizen side
- The widget no longer shows the `Multiloc`, but the real idea titles for some platforms

### Added

- Speed improvements to data requests to the backend throughout the whole paltform
- Changing the participation method from ideation to information/survey when there are ideas present is now prevented by the UI
- It's now possible to manually reorder archived projects
- There's new in-platform notifications for a status change on an idea you commented or voted on

## 2019-07-18

### Fixed

- It's no longer possible to change the participation method to information or survey if a phase/project already contains ideas
- The 'Share your idea modal' is now properly centered
- It's no longer possible to send out a manual email campaign when the author is not properly defined
- Invite emails are being sent out again
- Imported ideas no longer cause incomplete pages of idea cards
- Invited users who did not accept yet no longer receive any automated digest emails

## 2019-07-08

### Fixed

- When changing images like the project header, it's no longer needed to refresh to see the result
- The comments now display with a shorter date format to work better on smaller screens
- The code snippet from the widget will now work in some website that are strict on valid html
- The number of days in the assignee digest email is no longer 'null'
- The project preview description input is displayed again in the projects admin
- The idea status is no longer hidden when no vote buttons are displayed on the idea page
- Duplicate idea cards no longer appear when loading new pages

### Added

- Performance optimizations on the initial loading of the platform
- Performance optimizations on loading new pages of ideas and projects
- Newly uploaded images are automatically optimized to be smaller in filesize and load faster
- The 'Add an idea' button is now shown in every tab of the projects admin
- It's now possible to add videos to the idea body text
- E-mails are no longer sent out through Vero, but are using the internal cl2-emails server

### Changed

- The automated emails in the admin no longer show the time schedule, to work around the broken translations
- The rights for voting on comments now follow the same rights than commenting itself, instead of following the rights for idea voting
- On smaller desktop screens, 3 columns of idea cards are now shown instead of 2
- When adding an idea from the map, the idea will now be positioned on the exact location that was clicked instead of to the nearest detectable address
- Using the project copy tool in admin HQ is more tolerant about making copies of inconsistent source projects

## 2019-06-19

### Fixed

- Show 3-column instead of 2-column layout for ideas overview page on smaller desktop screens
- Don't hide status label on idea page when voting buttons are not shown

### Changed

- Small improvement in loading speed

## 2019-06-17

## Fixed

- The column titles in comments excel export are aligned with the content
- There's now enough space between voting anc translate links under a comment
- Vote button on an idea no longer stays active when a vote on that idea causes the voting treshold of the project to be reached

## Added

- The admin part of the new citizen initiatives is available (set initiatives feature on `allowed`)
  - Cities can configure how they plan to use initiatives
- A preview of how initiatives will look like city side is available, not yet ready for prime time (set initiatives feature on `allowed` and `enabled`)
- The ideas overview page has a new filtering sidebar, which will be used for other idea and initiative listings in the future
  - On idea status
  - On topic
  - Search
- Comments now load automatically while scrolling down, so the first comments appear faster

## 2019-06-05

### Fixed

- Fix an issue that when showing some ideas in an idea card would make the application crash

## 2019-05-21

### Fixed

- The idea page does no longer retain its previous scroll position when closing and reopening it
- The Similar Ideas box no longer has a problem with long idea titles not fitting inside of the box
- The Similar Ideas box content did not update when directly navigating from one idea page to the next
- The 'What were you looking for?' modal no longer gives an error when trying to open it

### Changed

- You now get redirected to the previously visited page instead of the landing page after you've completed the signup process

## 2019-05-20

### Fixed

- Closing the notification menu after scrolling no longer results in a navbar error
- When accessing the idea manager as a moderator, the assignee filter defaults to 'assigned to me'
- The idea and comment counts on the profile page now update as expected
- It's now possible to use a dropdown input in the 2nd registration step with a screen reader
- An invited user can no longer request a password reset, thereby becoming an inconsistent user that resulted in lots of problems

### Added

- Restyle of the idea page
  - Cleaner new style
  - Opening an idea no longer appears to be a modal
  - Properly styled similar ideas section
  - Showing comment count and avatars of contributors

### Changed

- When clicking the edit button in the idea manager, the edit form now opens in the sidemodal

## 2019-05-15

### Fixed

- Opening the projects dropdown no longer shows all menu items hovered when opened
- Users that can't contribute (post/comment/vote/survey) no longer get an email when a phase starts
- When a project has an ideation and a PB phase, the voting buttons are now shown during the ideation phase
- The admin navigation menu for moderators is now consistent with that for admins
- Moderators that try to access pages only accessible for admins, now get redirected to the dashboard
- The details tab in clustering doesn't cause the info panel to freeze anymore
- When writing an official update, the sbumit button now only becomes active when submission is possible
- The 'no options' copy in a dropdown without anything inside is now correctly translated
- Making a field empty in Admin HQ now correctly saves the empty value
- The active users graph no longer includes users that received an email as being active
- The translation button in an idea is no longer shown when there's only one platform language
- After changing granular permission, a refresh is no longer needed to see the results on ideas
- The sideview in the idea manager now shows the status dropdown in the correct language
- The layout of the sideview in the idea manager is now corrected
- A digest email to idea assignees is no longer sent out when no ideas are assigned to the admin/moderator
- Signing in with VUB Net ID works again
- Loading the insights map can no longer be infinite, it will now show an error message when the request fails

### Added

- The profile page of a user now also shows the comments by that user
- Users can now delete their own profile from their edit profile page
- Similar ideas, clustering and location detection now work in Spanish, German, Danish and Norwegian
- Facebooks bot coming from `tfbnw.net` are now blocked from signing up
- Moderators now also have a global idea manager, showing all the ideas from the projects they're moderating
- Loading the insights map, which can be slow, now shows a loading indicator

### Changed

- Voting buttons are no longer shown when voting is not enabled
- Improved and more granular copy text for several voting and commenting disabled messages

## 2019-04-30

### Fixed

- Time remaning on project card is no longer Capitalized
- Non-admin users no longer get pushed to intercom
- Improvements to the idea manager for IE11
- When filtering on a project in the idea manager, the selected project is highlighted again
- @citizenlab.cl admins can now also access churned platforms
- The user count in the user manager now includes migrated cl1 users
- Sending invitations will no longer fail on duplicate mixed-case email addresses

### Added

- Ideas can now be assigned to moderators and admins in the idea manager
  - Added filter on assignee, set by default to 'assigned to me'
  - Added filter to only show ideas that need feedback
  - When clicking an idea, it now opens in and can be partially edited from a half screen modal
  - Admins and moderators get a weekly digest email with their ideas that need feedback
- Completely new comments UI with support for comment upvotes
  - Comments are visually clearly grouped per parent comment
  - Sub-comments use @mentions to target which other subcomment they reply to
  - Comments can be sorted by time or by votes
- Ideas can now be sorted randomly, which is the new default
- New smart group rule for users that contributed to a specific topic
- New smart group rule for users that contributed to ideas with a specific status
- Clear error message when an invitee does a normal sign up

### Changed

- The idea grid no longer shows a 'post an idea' button when there are no ideas yet

## 2019-04-24

### Fixed

- Project cards now show correct time remaining until midnight

## 2019-04-23

### Fixed

- Closing the notification menu does not cause an error anymore
- The unread notifications count is now displayed correctly on IE11
- Clicking on an invite link will now show an immediate error if the invite is no longer valid

### Changed

- The admin guide is now under the Get Started link and the dashboards is the admin index
- The project cards give feedback CTA was removed
- An idea can now be deleted on the idea page
- The default border radius throughout the platform now is 3px instead of 5px
- The areas filter on the project cards is only shown when there is more than one area

## 2019-04-16

### Fixed

- The comment count of a project remains correct when moving an idea to a different project
- Fixed an issue when copying projects (through the admin HQ) to tenants with conflicting locales
- Only count people who posted/voted/commented/... as participants (this is perceived as a fix in the dashboards)
- Invites are still sent out when some emails correspond to existing users/invitees
- Phase started/upcoming notifications are only sent out for published projects

### Added

- Posting text with a URL will turn the URL part into a link
- Added smart group rules for topic and idea status participants

### Changed

- New configuration for which email campaigns are enabled by default
- Changed project image medium size to 575x575

## 2019-04-02

### Fixed

- The new idea button now shows the tooltip on focus
- The gender graph in clustering is now translated
- Tooltips on the right of the screen no longer fall off
- Text in tooltips no longer overflows the tooltip borders
- When there are no ideas, the 'post an idea' button is no longer shown on a user profile or the ideas overview page
- The project card no longer displays a line on the bottom when there is no meta information available
- Downloading the survey results now consistently triggers a browser download
- The bottom of the left sidebar of the idea manager can now be reached when there are a lot of projects
- The time control in the admin dashboard is now translated
- Various fixes to improve resilience of project copy tool

### Added

- The ideas overview page now has a project filter
- The various pages now support the `$|orgName|` variable, which is replaced by the organization name of the tenant
- Non-CitizenLab admins can no longer access the admin when the lifecycle stage is set to churned
- A new style variable controls the header opacity when signed in
- New email as a reminder to an invitee after 3 days
- New email when a project phase will start in a week
- New email when a new project phase has started
- The ideas link in the navbar is now feature flagged as `ideas_overview`

### Changed

- When filtering projects by multiple areas, all projects that have one of the areas or no area are now shown
- The user search box for adding a moderator now shows a better placeholder text, explaining the goal

## 2019-03-20

### Fixed

- Fixed mobile layout issues with cookie policy, idea image and idea title for small screens (IPhone 5S)
- Posting an idea in a timeline that hasn't started yet (as an admin) now puts the idea in the first phase
- Notifications menu renders properly in IE11
- The CTA on project cards is no longer shown for archived and finished projects
- Invited users that sign up with another authentication provider now automatically redeem their invitation
- When the tenant only has one locale, no language switcher is shown in the official feedback form

### Added

- Capabilities have been added to apply custom styling to the platform header
  - Styling can be changed through a new style tab in admin HQ
  - It's also possible to configure a different platform-wide font
  - Styling changes should only be done by a designer or front-end developer, as there are a lot of things that could go wrong
- The initial loading speed of the platform has increased noticably due to no longer loading things that are not immediately needed right away.
- Tenant templates are now automatically updated from the `.template` platforms every night
- The project copy tool in admin HQ now supports time shifting and automatically tries to solve language conflicts in the data
- New notifications and emails for upcoming (1 week before) and starting phases

### Changed

- Archived ieas are no longer displayed on the general ideas page
- The time remaining on project cards is no longer shown on 2 lines if there's enough space
- New platforms will show the 'manual project sorting' toggle by default
- Some changes were made to modals throughout to make them more consistent and responsiveness
- New ideas now have a minimal character limit of 10 for the title and 30 for the body
- User pages have a more elaborate meta title and description for SEO purposes

## 2019-03-11

### Fixed

- Notifications layout on IE11
- Errors due to loading the page during a deployment

## 2019-03-11

### Fixed

- Similar ideas is now fast enough to enable in production
- NLP insights will no longer keep on loading when creating a new clusgtering graph
- The comment count on project cards now correctly updates on deleted comments
- Various spacing issues with the new landing page on mobile are fixed
- When logging out, the avatars on the project card no longer disappear
- The widget no longer cuts off the title when it's too long
- In admin > settings > pages, all inputs are now correctly displayed using the rich text editor
- The notifications are no longer indented inconsistently
- Exporting typeform survey results now also work when the survey embed url contains `?source=xxxxx`
- When there's a dropdown with a lot of options during signup, these options are no longer unreachable when scrolling down
- The cookie policy no longer displays overlapping text on mobile
- The `isSuperAdmin`, `isProjectModerator` and `highestRole` user properties are now always named using camelCasing

### Added

- Official feedback
  - Admins and moderators can react to ideas with official feedback from the idea page
  - Users contributing to the idea receive a notification and email
  - Feedback can be posted using a free text name
  - Feedback can be updated later on
  - Admin and moderators can no longer write top-level comments
  - Comments by admins or moderators carry an `Official` badge
- When giving product feedback from the footer, a message and email can be provided for negative feedback
- CTA on project card now takes granular permissions into account
- CTA on project card is now also shown on mobile
- Projects for which the final phase has finished are marked as finished on their project card
- Projects on the landing page and all projects page can now be filtered on area through the URL

### Changed

- The avatars on a project card now include all users that posted, voted or commented
- Commenting is no longer possible on ideas not in the active phase

## 2019-03-03

### Fixed

- Manually sorting projects in the admin works as expected

### Added

- Support for Spanish
- The copy of 'x is currently working on' can be customized in admin HQ
- Extra caching layer in cl2-nlp speeds up similar ideas and creating clusters

## 2019-02-28

### Fixed

- In the dashboard, the labels on the users by gender donut chart are no longer cut off
- Adding file attachments with multiple consecutive spaces in the filename no longer fails
- Project copy in admin HQ no longer fails when users have mismatching locales with the new platform

### Added

- New landing page redesign
  - Project cards have a new layout and show the time remaining, a CTA and a metric related to the type of phase
  - The bottom of the landing page displays a new custom info text, configurable in the admin settings
  - New smarter project sorting algorithm, which can be changed to manual ordering in the projects admin
  - Ideas are no longer shown on the landing page
  - The `Show all projects` link is only shown when there are more than 10 projects
- New attributes are added to segment, available in all downstream tools:
  - `isSuperAdmin`: Set to true when the user is an admin with a citizenlab email
  - `isProjectModerator`
  - `highestRole`: Either `super_admin`, `admin`, `project_moderator` or `user`

### Changed

- Intercom now only receives users that are admin or project moderator (excluding citizenlab users)

## 2019-02-20

### Fixed

- User digest email events are sent out again
- The user statistics on the admin dashboard are back to the correct values
- Creating a new project page as an admin does not result in a blank page anymore
- Improved saving behaviour when saving images in a phase's description
- When logged in and visiting a url containing another locale than the one you previously picked, your locale choice is no longer overwritten

### Added

- Project copy feature (in admin HQ) now also supports copying ideas (including comments and votes) and allows you to specify a new slug for the project URL
- Unlogged users locale preference is saved in their browser

## 2019-02-14

### Fixed

- Project/new is no longer a blank page

## 2019-02-13

### Fixed

- Texts written with the rich text editor are shown more consistently in and outside of the editor
- Opening a dropdown of the smart group conditions form now scrolls down the modal
- When changing the sorting method in the ideas overview, the pagination now resets as expected
- Google login no longer uses the deprecated Google+ authentication API

### Added

- Typeform survey for typeform can now be downloaded as xlsx from a tab in the project settings
  - The Segment user token needs to be filled out in Admin HQ
  - New survey responses generate an event in segment
- Survey providers can be feature flagged individually
- New \*.template.citizenlab.co platforms now serve as definitions of the tenant template
- The registration fields overview in admin now shows a badge when fields are required

### Changed

- Surveymonkey is now feature-flagged off by default for new platforms

## 2019-01-30

### Fixed

- Long topic names no longer overlap in the admin dashboards
- Video no longer pops out of the phase description text
- Added event tracking for widget code copy and changing notification settings
- Saving admin settings no longer fails because of a mismatch between platform and user languages
- The password reset message now renders correctly on IE11
- It's easier to delete a selected image in the rich text editor
- The copy in the modal to create a new group now renders correctly in IE11
- Texts used in the the dashboard insights are no longer only shown in English
- Tracking of the 'Did you find what you're looking for?' footer not works correctly

### Added

- Tooltips have been added throughout the whole admin interface
- A new homepage custom text section can be configured in the admin settings, it will appear on the landing page in a future release
- New experimental notifications have been added that notify admins/moderators on every single idea and comment
- New tenant properties are being logged to Google Analytics

## 2019-01-19

### Fixed

- Registration fields of the type 'multiple select' can again be set in the 2nd step of the signup flow
- Creating invitations through an excel file no longer fails when there are multiple users with the same first and last name

## 2019-01-18

### Fixed

- Overflowing text in project header
- Fixed color overlay full opaque for non-updated tenant settings
- Fixed avatar layout in IE11
- Fixed idea page scrolling not working in some cases on iPad
- Pressing the enter key inside of a project settings page will no longer trigger a dialog to delet the project

### Changed

- Reduced the size of the avatars on the landing page header and footer
- Made 'alt' text inside avatar invisible
- Better cross-browser scaling of the background image of the header that's being shown to signed-in users
- Added more spacing underneath Survey, as not to overlap the new feedback buttons
- Increased width of author header inside of a comment to better accomodate long names
- Adjusted avatar hover effect to be inline with design spec￼

## 2019-01-17

### Added

- `header_overlay_opacity` in admin HQ allows to configure how transparent header color is when not signed in
- `custom_onboarding_fallback_message` in admin HQ allows to override the message shown in the header when signed in

## 2019-01-16

### Fixed

- The clustering prototype no longer shows labels behind other content
- Removing a project header image is again possible
- New active platforms get properly submitted to google search console again
- Scrolling issues with an iPad on the idea modal have been resolved
- Signing up through Google is working again
- The line underneath active elements in the project navbar now has the correct length
- A long location does no longer break the lay-out of an event card
- The dashboards are visible again by project moderators
- The admin toggle in the users manager is working again

### Added

- When logged in, a user gets to see a dynamic call to action, asking to
  - Complete their profile
  - Display a custom message configurable through admin HQ
  - Display the default fallback engagement motivator
- The landing page header now shows user avatars
- It's now possible to post an idea from the admin idea manager
- The footer now shows a feedback element for citizens
- A new 'map' dashboard now shows the ideas on their locations detected from the text using NLP
- The clustering prototype now shows the detected keywords when clustering is used

### Changed

- The navbar and landing page have a completely refreshed design
  - The font has changed all over the platform
  - 3 different colors (main, secondary, text) are configurable in Admin HQ
- The clustering prototype has been moved to its own dashboard tab
- Project cards for continuous projects now link to the information page instead of ideas

## 2018-12-26

### Fixed

- The rich text editor now formats more content the same way as they will be shown in the platform

### Added

- Admin onboarding guide
  - Shown as the first page in the admin, guiding users on steps to take
- The idea page now shows similar ideas, based on NLP
  - Feature flagged as `similar_ideas`, turned off by default
  - Experimental, intended to evaluate NLP similarity performance
- A user is now automatically signed out from FranceConnect when signing out of the platform

### Changed

- When a user signs in using FranceConnect, names and some signup fields can no longer be changed manually
- The FranceConnect button now has the official size and dimensions and no T&C
- SEO improvements to the "Powered by CitizenLab" logo

## 2018-12-13

### Fixed

- User digest email campaigns is sent out again
- IE11 UI fixes:
  - Project card text overflow bug
  - Project header text wrapping/centering bug
  - Timeline header broken layout bug
  - Dropdown not correctly positioned bug
- Creating new tenants and changing the host of existing tenants makes automatic DNS changes again

### Added

- SEO improvements: project pages and info pages are now included in sitemap
- Surveys now have Google Forms support

## 2018-12-11-2

### Fixed

- A required registration field of type number no longer blocks users on step 2 of the registration flow

## 2018-12-11

### Fixed

- Loading an idea page with a deleted comment no longer results in an error being shown
- Assigning a first bedget to a PB project as a new user no longer shows an infinite spinner
- Various dropdowns, most famously users group selection dropdown, no longer overlap menu items

## 2018-12-07

### Fixed

- It's again possible to write a comment to a comment on mobile
- When logged in and trying to log in again, the user is now redirected to the homepage
- A deleted user no longer generates a link going nowhere in the comments
- The dropdown menu for granular permissions no longer disappears behind the user search field
- After deleting an idea, the edit and delete buttons are no longer shown in the idea manager
- Long event title no longer pass out of the event box
- Notifications from a user that got deleted now show 'deleted user' instead of nothing

### Added

- Machine translations on the idea page
  - The idea body and every comment not in the user's language shows a button to translate
  - Feature flagged as `machine_translations`
  - Works for all languages
- Show the currency in the amount field for participatory budgeting in the admin
- Built-in registration fields can now be made required in the admin
- FranceConnect now shows a "What is FranceConnect?" link under the button

### Changed

- The picks column in the idea manager no longer shows a euro icon

## 2018-11-28

### Fixed

- IE11 graphical fixes in text editor, status badges and file drag&drop area fixed
- The idea tab is visible again within the admin of a continuous PB project
- The checkbox within 3rd party login buttons is now clickable in Firefox

## 2018-11-27

### Fixed

- When all registration fields are disabled, signing up through invite no longer blocks on the first step
- A moderator that has not yet accepted their invitation, is no longer shown as 'null null' in the moderators list
- Adding an idea by clicking on the map is possible again

### Changed

- When there are no events in a project, the events title is no longer shown
- The logo for Azure AD login (VUB Net ID) is shown as a larger image
- When logging in through a 3rd party login provider, the user needs to confirm that they've already accepted the terms and conditions

## 2018-11-22

### Fixed

- In the clustering prototype, comparing clusters using the CTRL key now also works on Mac
- Widget HTML code can now be copied again
- Long consequent lines of text now get broken up in multiple lines on the idea page
- Admin pages are no longer accessible for normal users
- Reduced problems with edge cases for uploading images and attachments

### Added

- Participatory budgeting (PB)
  - A new participation method in continuous and timeline projects
  - Admins and moderators can set budget on ideas and a maximum budget on the PB phase
  - Citizens can fill their basket with ideas, until they hit the limit
  - Citizens can submit their basket when they're done
  - Admins and moderators can process the results through the idea manager and excel export
- Advanced dashboards: iteration 1
  - The summary tab shows statistics on idea/comment/vote and registration activities
  - The users tab shows information on user demographics and a leaderboard
  - The time filter can be controller with the precision of a day
  - Project, group and topic filters are available when applicable
  - Project moderators can access the summary tabs with enforced project filter
- Social sharing through the modal is now separately trackable from sharing through the idea page
- The ideas excel export now contains the idea status
- A new smart group rule allows for filtering on project moderators and normal users

### Changed

- Project navigation is now shown in new navigation bar on top
- The content of the 'Open idea project' for new tenants has changed
- After posting an idea, the user is redirected towards the idea page of the new idea, instead of the landing page

## 2018-11-07

### Fixed

- The widget HTML snippet can be copied again

## 2018-11-05

### Fixed

- Clicking Terms & Conditions links during sign up now opens in a new tab

### Added

- Azure Active Directory login support, used for VUB Net ID

## 2018-10-25

### Fixed

- Resizing and alignment of images and video in the editor now works as expected
- Language selector is now updating the saved locale of a signed in user
- When clicking "view project" in the project admin in a new tab, the projects loads as expected
- The navbar user menu is now keyboard accessible
- Radio buttons in forms are now keyboard accessible
- The link to the terms and conditions from social sign in buttons is fixed
- In admin > settings > pages, the editors now have labels that show the language they're in
- Emails are no longer case sensitive, resolving recurring password reset issues
- The widget now renders properly in IE11
- Videos are no longer possible in the invitation editor

### Added

- Cookie consent manager
  - A cookie consent footer is shown when the user has not yet accepted cookies
  - The user can choose to accept all cookies, or open the manager and approve only some use cases
  - The consent settings are automatically derived from Segment
  - When the user starts using the platform, they silently accept cookies
- A new cookie policy page is easier to understand and can no longer be customized through the admin
- Granular permissions
  - In the project permissions, an admin or project moderator can choose which citizens can take which actions (posting/voting/comments/taking survey)
  - Feature flagged as 'granular_permissions', turned off by default
- Ideas excel export now contains links to the ideas
- Ideas and comments can now be exported from within a project, also by project moderators
- Ideas and comments can now be exported for a selection of ideas
- When signing up, a user gets to see which signup fields are optional

### Changed

- Published projects are now shown first in the admin projects overview
- It's now more clear that the brand color can not be changed through the initial input box
- All "Add <something>" buttons in the admin have moved to the top, for consistency
- The widget no longer shows the vote count when there are no votes
- When a project contains no ideas, the project card no longer shows "no ideas yet"

## 2018-10-09

### Fixed

- UTM tags are again present on social sharing
- Start an idea button is no longer shown in the navbar on mobile
- Exceptionally slow initial loading has been fixed
- Sharing on facebook is again able to (quite) consistently scrape the images
- When using the project copy tool in Admin HQ, attachments are now copied over as well

### Added

- Email engine in the admin (feature flagged)
  - Direct emails can be sent to specific groups by admins and moderators
  - Delivered/Opened/Clicked statistics can be seen for every campaign
  - An overview of all automated emails is shown and some can be disabled for the whole platform

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
- larsseit font is now always being loaded

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
- The font has changed again to larsseit

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

- Voting on cards and in an idea page
- Idea modal loading speed
- Unread notification counter

### Added

- New improved flow for posting an idea
- Admin interface for projects
- New design for idea and project cards
- Consistenly applied modal, with new design, for ideas
- Segment.io integration, though not all events are tracked yet

### Changed

- Idea URls now using slugs for SEO
