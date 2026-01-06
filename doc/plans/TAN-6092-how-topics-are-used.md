# How Topics Are Used (1)

This document describes how the Topic model is used throughout the codebase. Topics serve two distinct use cases:

- **(A) Project/Folder Categorization**: Platform-level tagging to describe what projects are about
- **(B) Idea Form Tags**: Configuration of which topics users can select when submitting ideas

## Data Model

### Core Model

**File**: `back/app/models/topic.rb`

The `Topic` model has the following attributes:

- `title_multiloc` - Multilingual topic title
- `description_multiloc` - Multilingual topic description
- `icon` - Topic icon identifier
- `ordering` - Custom ordering (acts_as_list)
- `followers_count` - Number of followers
- `include_in_onboarding` - Whether to show in onboarding flow
- `default` - Whether this is a default topic

Topics are defined at the **platform level** and shared across both use cases.

### Join Tables

### (A) ProjectsTopic - Project Categorization

**Table**: `projects_topics`**Model**: `back/app/models/projects_topic.rb`

Associates topics with projects to describe what each project is about.

```ruby
belongs_to :projectbelongs_to :topic
```

### (B) ProjectsAllowedInputTopic - Idea Form Configuration

**Table**: `projects_allowed_input_topics`**Model**: `back/app/models/projects_allowed_input_topic.rb`

Defines which topics are available for selection in a project’s idea submission form.

```ruby
belongs_to :projectbelongs_to :topicacts_as_list column: :ordering, scope: [:project_id]
```

Includes per-project ordering of topics.

### IdeasTopic - Actual Idea Tags

**Table**: `ideas_topics`**Model**: `back/app/models/ideas_topics.rb`

Records which topics a user selected when submitting an idea.

```ruby
belongs_to :ideabelongs_to :topic
```

### StaticPagesTopic

**Table**: `static_pages_topics`**Model**: `back/app/models/static_pages_topic.rb`

Associates topics with static pages for filtering purposes.

### Model Associations

**Project** (`back/app/models/project.rb`):

```ruby
has_many :projects_topics, dependent: :destroyhas_many :topics, through: :projects_topics                        # (A)has_many :projects_allowed_input_topics, dependent: :destroyhas_many :allowed_input_topics, through: :projects_allowed_input_topics  # (B)
```

**Idea** (`back/app/models/idea.rb`):

```ruby
has_many :ideas_topics, dependent: :destroyhas_many :topics, through: :ideas_topics
```

**StaticPage** (`back/app/models/static_page.rb`):

```ruby
has_many :static_pages_topics, dependent: :destroyhas_many :topics, through: :static_pages_topicsenum :projects_filter_type, { no_filter: 'no_filter', areas: 'areas', topics: 'topics' }
```

**Note**: Folders (`ProjectFolders::Folder`) do not have topic associations.

---

## Backend API

### Topics Controller

**File**: `back/app/controllers/web_api/v1/topics_controller.rb`

| Endpoint                    | Description                            | Authorization |
| --------------------------- | -------------------------------------- | ------------- |
| `GET /topics`               | List all topics with filtering/sorting | Public        |
| `GET /topics/:id`           | Get single topic                       | Public        |
| `POST /topics`              | Create topic                           | Admin only    |
| `PATCH /topics/:id`         | Update topic                           | Admin only    |
| `PATCH /topics/:id/reorder` | Reorder topics                         | Admin only    |
| `DELETE /topics/:id`        | Delete topic                           | Admin only    |

Filtering options:

- `for_homepage_filter` - Topics for projects visible on homepage
- `for_onboarding` - Topics with `include_in_onboarding: true`
- `ideas` parameter - Filter to topics that have ideas matching criteria

Sorting options: `custom`, `new`, `-new`, `projects_count`, `-projects_count`, `ideas_count`, `-ideas_count`

### Projects Allowed Input Topics Controller (B)

**File**: `back/app/controllers/web_api/v1/projects_allowed_input_topics_controller.rb`

| Endpoint                                           | Description                       | Authorization     |
| -------------------------------------------------- | --------------------------------- | ----------------- |
| `GET /projects_allowed_input_topics`               | List allowed topics for a project | Public            |
| `POST /projects_allowed_input_topics`              | Add topic to project’s form       | Project moderator |
| `PATCH /projects_allowed_input_topics/:id/reorder` | Reorder topics for project        | Project moderator |
| `DELETE /projects_allowed_input_topics/:id`        | Remove topic from project’s form  | Project moderator |

### Stats Controllers

**Files**:

- `back/app/controllers/web_api/v1/stats_ideas_controller.rb`
- `back/app/controllers/web_api/v1/stats_comments_controller.rb`
- `back/app/controllers/web_api/v1/stats_reactions_controller.rb`

| Endpoint                                | Description                      |
| --------------------------------------- | -------------------------------- |
| `GET /stats/ideas_by_topic`             | Idea counts grouped by topic     |
| `GET /stats/ideas_by_topic_as_xlsx`     | Excel export                     |
| `GET /stats/comments_by_topic`          | Comment counts grouped by topic  |
| `GET /stats/comments_by_topic_as_xlsx`  | Excel export                     |
| `GET /stats/reactions_by_topic`         | Reaction counts grouped by topic |
| `GET /stats/reactions_by_topic_as_xlsx` | Excel export                     |

These endpoints aggregate data from `ideas_topics` (the actual tags users selected).

---

## Frontend Components

### Topic Management (Admin)

| Component       | File                                                                 | Purpose                     |
| --------------- | -------------------------------------------------------------------- | --------------------------- |
| TopicForm       | `front/app/containers/Admin/settings/topics/TopicForm/`              | Create/edit topics          |
| TopicsList      | `front/app/containers/Admin/settings/topics/`                        | List all platform topics    |
| TopicTermConfig | `front/app/containers/Admin/settings/topics/all/TopicTermConfig.tsx` | Configure topic terminology |

### (A) Project Categorization

| Component   | File                                                                             | Purpose                               |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| TopicInputs | `front/app/containers/Admin/projects/project/general/components/TopicInputs.tsx` | Select topics that describe a project |

### (B) Idea Form Configuration

| Component                | File                                                                              | Purpose                                     |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------- |
| ProjectTopicSelector     | `front/app/containers/Admin/projects/project/topics/ProjectTopicSelector.tsx`     | Add topics to project’s idea form           |
| SortableProjectTopicList | `front/app/containers/Admin/projects/project/topics/SortableProjectTopicList.tsx` | Reorder topics for idea form                |
| TopicsSettings           | `front/app/components/FormBuilder/components/FormBuilderSettings/TopicsSettings/` | Configure min/max selection in form builder |

### Idea Submission Form

| Component         | File                                             | Purpose                            |
| ----------------- | ------------------------------------------------ | ---------------------------------- |
| Topics (HookForm) | `front/app/components/HookForm/Topics/index.tsx` | Topic selection field in idea form |

This component fetches `ProjectAllowedInputTopics` to determine which topics to display.

### Filtering Components

| Component           | File                                                                                             | Purpose                                      |
| ------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| TopicsFilter        | `front/app/components/FilterBoxes/TopicsFilter.tsx`                                              | Filter UI for selecting topics               |
| TopicFilterBox      | `front/app/components/IdeaCards/shared/Filters/TopicFilterBox.tsx`                               | Wrapper that fetches topics with idea counts |
| FilterSidebarTopics | `front/app/components/admin/PostManager/components/FilterSidebar/topics/FilterSidebarTopics.tsx` | Admin post manager filter                    |

### API Hooks

**Topics**:

- `front/app/api/topics/useTopics.ts`
- `front/app/api/topics/useTopic.ts`
- `front/app/api/topics/useAddTopic.ts`
- `front/app/api/topics/useUpdateTopic.ts`
- `front/app/api/topics/useDeleteTopic.ts`

**Project Allowed Input Topics (B)**:

- `front/app/api/project_allowed_input_topics/useProjectAllowedInputTopics.ts`
- `front/app/api/project_allowed_input_topics/useAddProjectAllowedInputTopic.ts`
- `front/app/api/project_allowed_input_topics/useDeleteProjectAllowedInputTopic.ts`
- `front/app/api/project_allowed_input_topics/useReorderProjectAllowedInputTopics.ts`

**Stats**:

- `front/app/api/ideas_by_topic/useIdeasByTopic.ts`
- `front/app/api/comments_by_topic/useCommentsByTopic.ts`
- `front/app/api/reactions_by_topic/useReactionsByTopic.ts`

---

## Feature Integration

### Custom Fields / Form Builder

**File**: `back/app/models/custom_field.rb`

Topics are available as a built-in custom field type:

```ruby
INPUT_TYPES = [..., 'topic_ids', ...]CODES = [..., 'topic_ids', ...]
```

This allows the `topic_ids` field to be included in idea submission forms with configurable minimum/maximum selection counts.

### Following System

**File**: `back/app/models/topic.rb`

```ruby
has_many :followers, as: :followable, dependent: :destroy
```

Users can follow topics. The `include_in_onboarding` flag determines which topics are shown during user onboarding.

**Onboarding UI**: `front/app/containers/Authentication/steps/Onboarding/TopicsAndAreas/index.tsx`

### Notifications (A)

**File**: `back/app/models/notifications/project_published.rb`

When a project is published, users who follow topics assigned to that project receive a notification:

```ruby
followers = Follower.where(followable: project.topics)
             .or(Follower.where(followable: project.areas))
```

This uses `project.topics` from `projects_topics` (A), not from idea form configuration (B).

### Followed Projects Feed (A)

**File**: `back/app/services/projects_finder_service.rb`

The “followed by user” projects query includes projects that have topics the user follows:

```ruby
.joins('LEFT JOIN projects_topics ON projects_topics.topic_id = followed_topics.id')
```

This uses `projects_topics` (A).

### All Ideas Page Filtering

**File**: `front/app/containers/IdeasIndexPage/index.tsx`

The platform-wide “All Ideas” page uses `TopicFilterBox` to filter ideas by topic across all projects.

**File**: `front/app/components/IdeaCards/shared/Filters/TopicFilterBox.tsx`

Fetches topics sorted by idea count, filtered to topics that have matching ideas:

```tsx
const { data: topics } = useTopics({
  sort: "-ideas_count",
  ideas: ideaFiltersWithoutTopics,
});
```

### Admin Dashboard Charts

**File**: `front/app/containers/Admin/dashboard/overview/charts/SelectableResourceByTopicChart.tsx`

Displays “Participation per Topic” chart showing ideas, comments, or reactions grouped by topic. Can be filtered by date range and project.

### Analysis Engine

**File**: `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb`

The `PlatformTopic` auto-tagging method creates analysis tags based on `IdeasTopic` associations:

```ruby
IdeasTopic  .where(idea: filtered_inputs)
  .includes(:topic)
  .each do |idea_topic|    tag_name = multiloc_service.t(idea_topic.topic.title_multiloc)
    # Creates Analysis::Tag from platform topic name  end
```

### Smart Groups

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`

Allows creating user groups based on participation in ideas with specific topics.

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/follow.rb`

Allows creating user groups based on which topics users follow.

### Public API

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/project_topics_controller.rb`

Exposes project topics (A) via the public API.

**File**: `back/engines/commercial/public_api/app/finders/public_api/ideas_finder.rb`

Supports filtering ideas by topic IDs.

### Static Pages

**File**: `back/app/models/static_page.rb`

Static pages can filter displayed projects by topic using `projects_filter_type: 'topics'`.

---

## Terminology Configuration

**App Configuration** (`front/app/api/app_configuration/types.ts`):

```tsx
topics_term: Multiloc; // Plural form (e.g., "Topics", "Tags", "Categories")topic_term: Multiloc   // Singular form
```

Platform administrators can customize the terminology used for topics throughout the UI.

---

## Database Migrations

Key migrations:

- `20170317133413_create_topics.rb` - Initial topics table
- `20170318143940_create_join_table_projects_topics.rb` - Original projects_topics
- `20170318181018_create_join_table_ideas_topics.rb` - ideas_topics
- `20220126110341_rename_projects_topics_to_projects_allowed_input_topics.rb` - Renamed to clarify purpose (B)
- `20220207103216_create_projects_topics.rb` - New projects_topics for use case (A)
- `20230906104541_add_include_in_onboarding_to_topics_and_areas.rb` - Added onboarding flag
