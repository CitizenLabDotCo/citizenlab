### The context on topics

Currently, Tags (Topics, using the terms interchangeably) are always created on a platform level. They are used for 2 distinct use cases:

1. **Project topics**, to categorize projects on the platform
2. **Input topics**, to categorize ideas (mostly within projects). Within a project, the available input topics and their order as a subset of the platform-level list can be configured, but topics can not be altered or new topics can’t be added on a project level.

There has been quite some feedback in the past that for use case (b), having this enforced link to platform level configuration is confusing, and limiting capabilities (e.g. project managers can’t create new tags).

## Goal

From a user perspective, we separate use case **(a) Project topics** completely from use case **(b)** **Input topics**.

**Project topics** still live and are defined on a platform level, and are selected on individual project from the global set just like they are today.

**Input topics** are always defined on a project-level, although the initial set of default topics, which are copied when a project is created, can still be configured on the platform level.

## Product impact: The blast radius of splitting up Project and Input topics

Following functionalities/code will need to be changed to incorporate the proposed change of splitting up the 2 use cases and making Input topics (without including changes needed for 2-level topics) project-level only.

- Our data model should distinguish between project tags and input tags. I'm thinking the most obvious approach is to create 2 separate tables, but open to alternatives.
- Admin > Settings > Tags should be split up in 2 interfaces, unconnected in terms of data
  - Project tags
    - CRUD
    - The ‘Terminology’ configuration for tags only applies to these topics
    - The `Included in onboarding` configuration
    - There is no notion of default tags
  - Default input tags (which input tags should be available on a project out of the box?)
    - CRUD
    - No options for setting a topic as `default` (these are always the defaults) or onboarding
- In Project settings
  - Project tags selector only shows project tags as options
  - Input tags should allow CRUD+reorder of topics. Any changes don’t affect anything outside of the project.
- The tag controls in the global idea manager are removed, the in-project idea manager only shows the Input tags for the project
- The “Participation per topic” graph in the global Overview dashboard is removed
- Everything related to ‘Following’ functionality (during onboarding or after) only makes use of Project tags
- In custom pages, the “filter by tag” only lists project tags
- The (sometimes forgotten) “All inputs” front-office page still lists all topics across all projects even if there are duplicate names. (only alternative seems to remove the topic filter from this page completely?)
- Smart group “participated in topic” still lists all topics across all projects (Maybe prefixed with the project name? Too long?)
- When creating a project, the input topics should become copies of the default topics, instead of references.
- A rake task duplicates all topic records that are being used in multiple projects, as well as categorize each tag correctly as a project or an input tag (or duplicates when used for both).
