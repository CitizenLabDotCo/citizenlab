# Backend Implementation Plan: Split Project and Input Topics

## Overview

This plan details the backend changes required to split Project topics (use case A - categorizing projects) from Input topics (use case B - tagging ideas). After this change:

- **Project topics** remain platform-level and are used to categorize projects
- **Input topics** become project-level (copied from "default input topics" when a project is created)

## Current State Summary

### Data Model

- `topics` table - Platform-level topics with `is_default`, `include_in_onboarding`, `ordering`
- `projects_topics` - Join table for project categorization (use case A)
- `projects_allowed_input_topics` - Join table for allowed idea tags per project (use case B)
- `ideas_topics` - Join table recording which topics an idea has
- `static_pages_topics` - Join table for filtering projects on static pages

### Key Relationships

- Projects have `topics` (through `projects_topics`) for categorization
- Projects have `allowed_input_topics` (through `projects_allowed_input_topics`) for idea forms
- Ideas have `topics` (through `ideas_topics`)
- Topics have `followers` (polymorphic)
- `Topic.defaults` scope returns topics with `is_default: true`

### Key Behaviors

- `Project#set_default_topics!` assigns `Topic.defaults` as `allowed_input_topics`
- Following a topic leads to notifications when projects with that topic are published (uses `projects_topics` - use case A)
- Stats (ideas_by_topic, etc.) group by `ideas_topics` (use case B)

---

## Implementation Plan

### Phase 1: Create New InputTopic Model and Table

**Goal**: Create a new `input_topics` table where input topics are stored per-project, separate from platform-level topics.

#### 1.1 Create Migration for `input_topics` Table

**File**: `back/db/migrate/XXXXXX_create_input_topics.rb`

```ruby
class CreateInputTopics < ActiveRecord::Migration[7.1]
  def change
    create_table :input_topics, id: :uuid do |t|
      t.references :project, type: :uuid, null: false, foreign_key: true, index: true
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, null: false, default: {}
      t.string :icon
      t.integer :ordering, null: false, default: 0
      t.timestamps
    end

    add_index :input_topics, [:project_id, :ordering]
  end
end
```

#### 1.2 Create InputTopic Model

**File**: `back/app/models/input_topic.rb`

```ruby
class InputTopic < ApplicationRecord
  acts_as_list column: :ordering, scope: [:project_id]

  belongs_to :project
  has_many :ideas_input_topics, dependent: :destroy
  has_many :ideas, through: :ideas_input_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
end
```

#### 1.3 Create Migration for `ideas_input_topics` Join Table

**File**: `back/db/migrate/XXXXXX_create_ideas_input_topics.rb`

```ruby
class CreateIdeasInputTopics < ActiveRecord::Migration[7.1]
  def change
    create_table :ideas_input_topics, id: :uuid do |t|
      t.references :idea, type: :uuid, null: false, foreign_key: true
      t.references :input_topic, type: :uuid, null: false, foreign_key: true
      t.timestamps
    end

    add_index :ideas_input_topics, [:idea_id, :input_topic_id], unique: true
  end
end
```

#### 1.4 Create IdeasInputTopic Model

**File**: `back/app/models/ideas_input_topic.rb`

```ruby
class IdeasInputTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :input_topic

  validates :input_topic_id, uniqueness: { scope: :idea_id }
end
```

#### 1.5 Create DefaultInputTopic Model

For storing default input topics that are copied to new projects.

**File**: `back/db/migrate/XXXXXX_create_default_input_topics.rb`

```ruby
class CreateDefaultInputTopics < ActiveRecord::Migration[7.1]
  def change
    create_table :default_input_topics, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, null: false, default: {}
      t.string :icon
      t.integer :ordering, null: false, default: 0
      t.timestamps
    end
  end
end
```

**File**: `back/app/models/default_input_topic.rb`

```ruby
class DefaultInputTopic < ApplicationRecord
  acts_as_list column: :ordering

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
end
```

---

### Phase 2: Update Project Model

#### 2.1 Add New Associations to Project

**File**: `back/app/models/project.rb`

Add:

```ruby
has_many :input_topics, -> { order(:ordering) }, dependent: :destroy
```

Update `set_default_topics!` method to copy DefaultInputTopics:

```ruby
def set_default_input_topics!
  DefaultInputTopic.order(:ordering).each do |default_topic|
    input_topics.create!(
      title_multiloc: default_topic.title_multiloc,
      description_multiloc: default_topic.description_multiloc,
      icon: default_topic.icon,
      ordering: default_topic.ordering
    )
  end
end
```

#### 2.2 Update Idea Model

**File**: `back/app/models/idea.rb`

Add new associations alongside existing ones (for transition period):

```ruby
has_many :ideas_input_topics, dependent: :destroy
has_many :input_topics, through: :ideas_input_topics
```

---

### Phase 3: Create InputTopics API

#### 3.1 Create InputTopics Controller

**File**: `back/app/controllers/web_api/v1/input_topics_controller.rb`

```ruby
module WebApi
  module V1
    class InputTopicsController < ApplicationController
      before_action :set_project
      before_action :set_input_topic, only: [:show, :update, :destroy, :reorder]

      def index
        @input_topics = policy_scope(InputTopic)
          .where(project: @project)
          .order(:ordering)
        render json: linked_json(@input_topics, InputTopicSerializer, params: jsonapi_params)
      end

      def show
        render json: serialize(@input_topic)
      end

      def create
        @input_topic = InputTopic.new(input_topic_params)
        @input_topic.project = @project
        authorize @input_topic

        if @input_topic.save
          SideFxInputTopicService.new.after_create(@input_topic, current_user)
          render json: serialize(@input_topic), status: :created
        else
          render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
        end
      end

      def update
        authorize @input_topic
        if @input_topic.update(input_topic_params)
          SideFxInputTopicService.new.after_update(@input_topic, current_user)
          render json: serialize(@input_topic)
        else
          render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
        end
      end

      def reorder
        authorize @input_topic
        if @input_topic.insert_at(reorder_params[:ordering])
          SideFxInputTopicService.new.after_update(@input_topic, current_user)
          render json: serialize(@input_topic)
        else
          render json: { errors: @input_topic.errors.details }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @input_topic
        input_topic = @input_topic.destroy
        if input_topic.destroyed?
          SideFxInputTopicService.new.after_destroy(input_topic, current_user)
          head :ok
        else
          render json: { errors: input_topic.errors.details }, status: :unprocessable_entity
        end
      end

      private

      def set_project
        @project = Project.find(params[:project_id])
      end

      def set_input_topic
        @input_topic = InputTopic.find(params[:id])
      end

      def input_topic_params
        params.require(:input_topic).permit(
          title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES,
          :icon
        )
      end

      def reorder_params
        params.require(:input_topic).permit(:ordering)
      end

      def serialize(input_topic)
        WebApi::V1::InputTopicSerializer.new(input_topic, params: jsonapi_params).serializable_hash
      end
    end
  end
end
```

#### 3.2 Create InputTopic Serializer

**File**: `back/app/serializers/web_api/v1/input_topic_serializer.rb`

```ruby
module WebApi
  module V1
    class InputTopicSerializer < ActiveModel::Serializer
      attributes :id, :title_multiloc, :description_multiloc, :icon, :ordering, :created_at, :updated_at

      belongs_to :project
    end
  end
end
```

#### 3.3 Create InputTopic Policy

**File**: `back/app/policies/input_topic_policy.rb`

```ruby
class InputTopicPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def show?
    true
  end

  def create?
    ProjectPolicy.new(user, record.project).update?
  end

  def update?
    ProjectPolicy.new(user, record.project).update?
  end

  def reorder?
    update?
  end

  def destroy?
    ProjectPolicy.new(user, record.project).update?
  end
end
```

#### 3.4 Create SideFxInputTopicService

**File**: `back/app/services/side_fx_input_topic_service.rb`

```ruby
class SideFxInputTopicService
  include SideFxHelper

  def after_create(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'created', user, input_topic.created_at.to_i)
  end

  def after_update(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'changed', user, input_topic.updated_at.to_i)
  end

  def after_destroy(frozen_input_topic, user)
    serialized_input_topic = clean_time_attributes(frozen_input_topic.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_input_topic),
      'deleted',
      user,
      Time.now.to_i,
      payload: { input_topic: serialized_input_topic }
    )
  end
end
```

#### 3.5 Add Routes

**File**: `back/config/routes.rb`

```ruby
resources :projects do
  resources :input_topics, controller: 'web_api/v1/input_topics', only: [:index, :create]
end

resources :input_topics, controller: 'web_api/v1/input_topics', only: [:show, :update, :destroy] do
  patch :reorder, on: :member
end
```

---

### Phase 4: Create DefaultInputTopics API

#### 4.1 Create DefaultInputTopics Controller

**File**: `back/app/controllers/web_api/v1/default_input_topics_controller.rb`

Similar structure to InputTopicsController but for admin-level management of default topics.

#### 4.2 Create DefaultInputTopic Serializer

**File**: `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`

#### 4.3 Create DefaultInputTopic Policy

**File**: `back/app/policies/default_input_topic_policy.rb`

Admin-only CRUD operations.

---

### Phase 5: Update Stats Controllers

#### 5.1 Update Stats Ideas Controller

**File**: `back/app/controllers/web_api/v1/stats_ideas_controller.rb`

Update `ideas_by_topic_serie` to:

- When project_id is provided: group by `ideas_input_topics.input_topic_id`
- When no project_id: either remove this endpoint or return aggregated data

```ruby
def ideas_by_topic_serie
  if params[:project]
    # Project-scoped: use input_topics
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = apply_project_filter(ideas)

    ideas
      .joins(:ideas_input_topics)
      .group('ideas_input_topics.input_topic_id')
      .order('ideas_input_topics.input_topic_id')
      .count
  else
    # Global: This should probably be removed per requirements
    # Or return empty/aggregated differently
    {}
  end
end
```

#### 5.2 Update Stats Comments Controller

**File**: `back/app/controllers/web_api/v1/stats_comments_controller.rb`

Similar changes - use `input_topics` when project-scoped.

#### 5.3 Update Stats Reactions Controller

**File**: `back/app/controllers/web_api/v1/stats_reactions_controller.rb`

Similar changes.

---

### Phase 6: Update Idea Submission Flow

#### 6.1 Update Custom Field Handling

**File**: `back/app/models/custom_field.rb`

The `topic_ids` field type needs to work with `input_topic_ids` instead.

Consider:

- Rename to `input_topic_ids` or
- Keep as `topic_ids` but change underlying behavior

#### 6.2 Update Idea Creation/Update

**File**: `back/app/controllers/web_api/v1/ideas_controller.rb`

Handle `input_topic_ids` parameter:

- Validate that provided IDs are valid input_topics for the project
- Create `ideas_input_topics` records

---

### Phase 7: Clean Up Topic Model for Project Topics Only

#### 7.1 Update Topic Model

**File**: `back/app/models/topic.rb`

Remove `is_default` attribute handling (no longer needed for project topics).

Remove associations:

- `has_many :projects_allowed_input_topics` (deprecated)
- `has_many :ideas_topics` (move to input_topics)

Keep:

- `has_many :projects_topics`
- `has_many :projects`
- `has_many :followers`
- `has_many :static_pages_topics`
- `include_in_onboarding` (for project topic following)

#### 7.2 Update Topics Controller

**File**: `back/app/controllers/web_api/v1/topics_controller.rb`

Remove:

- `is_default` attribute handling
- `ideas_count` sorting (no longer applicable)

Keep:

- CRUD for project topics
- `projects_count` sorting
- `for_onboarding` filter
- `for_homepage_filter` filter

---

### Phase 8: Update Following and Notifications

#### 8.1 Project Published Notifications

**File**: `back/app/models/notifications/project_published.rb`

No changes needed - already uses `project.topics` (project categorization topics through `projects_topics`).

#### 8.2 Followed Projects

**File**: `back/app/services/projects_finder_service.rb`

No changes needed - already uses `projects_topics` for topic-based project following.

---

### Phase 9: Update Smart Groups

#### 9.1 ParticipatedInTopic Rule

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`

This needs significant changes:

- Should now reference `input_topics` for participation
- Topic dropdown should list all `input_topics` across all projects
- Consider prefixing with project name to disambiguate

```ruby
def self.to_json_schema
  # List all input_topics across all projects
  topics = InputTopic.includes(:project).all
  {
    title_multiloc: {},
    type: 'array',
    uniqueItems: true,
    items: {
      type: 'string',
      enum: topics.map(&:id),
      enumNames: topics.map { |t| "#{t.project.title_multiloc.values.first}: #{t.title_multiloc.values.first}" }
    }
  }
end

def filter(users_scope)
  # Update to use input_topics
  ParticipantsService.new.input_topics_participants(input_topics)
end
```

#### 9.2 Follow Rule

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/follow.rb`

No changes needed - topic following is for project topics only.

---

### Phase 10: Update Analysis Engine

#### 10.1 PlatformTopic Auto-Tagging

**File**: `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb`

Update to use `ideas_input_topics` instead of `ideas_topics`:

```ruby
def run
  IdeasInputTopic
    .where(idea: filtered_inputs)
    .includes(input_topic: :project)
    .each do |idea_input_topic|
      tag_name = multiloc_service.t(idea_input_topic.input_topic.title_multiloc)
      # ... create Analysis::Tag
    end
end
```

---

### Phase 11: Update Public API

#### 11.1 Update Topics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/topics_controller.rb`

Keep as project-level topics only.

#### 11.2 Add InputTopics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/input_topics_controller.rb`

New endpoint for input topics:

- `GET /api/v2/input_topics` - list all input topics (filterable by project_id)
- `GET /api/v2/input_topics/:id`

#### 11.3 Update IdeaTopics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/idea_topics_controller.rb`

Rename to `IdeaInputTopicsController` or update to use `ideas_input_topics`.

#### 11.4 Update Ideas Finder

**File**: `back/engines/commercial/public_api/app/finders/public_api/ideas_finder.rb`

Update `filter_by_topic_ids` to use `input_topic_ids`:

```ruby
def filter_by_input_topic_ids(scope)
  return scope unless @input_topic_ids

  scope
    .joins(:input_topics)
    .where(input_topics: { id: @input_topic_ids })
    .group('ideas.id')
    .having('COUNT(input_topics.id) = ?', @input_topic_ids.size)
end
```

---

### Phase 12: Data Migration Rake Task

**File**: `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`

```ruby
namespace :topics do
  desc 'Migrate existing topics data to new input_topics structure'
  task migrate_to_input_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Step 1: Create default_input_topics from topics marked as default
      Topic.where(is_default: true).find_each do |topic|
        DefaultInputTopic.create!(
          title_multiloc: topic.title_multiloc,
          description_multiloc: topic.description_multiloc,
          icon: topic.icon,
          ordering: topic.ordering
        )
      end

      # Step 2: For each project, create input_topics from projects_allowed_input_topics
      Project.find_each do |project|
        project.projects_allowed_input_topics.order(:ordering).each do |pait|
          topic = pait.topic
          input_topic = project.input_topics.create!(
            title_multiloc: topic.title_multiloc,
            description_multiloc: topic.description_multiloc,
            icon: topic.icon,
            ordering: pait.ordering
          )

          # Map old topic to new input_topic for ideas migration
          @topic_to_input_topic_map ||= {}
          @topic_to_input_topic_map[[project.id, topic.id]] = input_topic.id
        end
      end

      # Step 3: Migrate ideas_topics to ideas_input_topics
      IdeasTopic.includes(:idea).find_each do |ideas_topic|
        project_id = ideas_topic.idea.project_id
        input_topic_id = @topic_to_input_topic_map[[project_id, ideas_topic.topic_id]]

        if input_topic_id
          IdeasInputTopic.create!(
            idea_id: ideas_topic.idea_id,
            input_topic_id: input_topic_id
          )
        else
          puts "Warning: No input_topic mapping for idea #{ideas_topic.idea_id}, topic #{ideas_topic.topic_id}"
        end
      end

      # Step 4: For topics used in both projects_topics AND projects_allowed_input_topics,
      # they remain as project topics. No action needed.

      # Step 5: Clean up topics that were only used as input topics
      # (not in projects_topics and not in static_pages_topics)
      Topic.left_joins(:projects_topics, :static_pages_topics)
           .where(projects_topics: { id: nil })
           .where(static_pages_topics: { id: nil })
           .where(include_in_onboarding: false)
           .destroy_all

      puts "Completed migration for tenant: #{tenant.host}"
    end
  end
end
```

---

### Phase 13: Deprecate Old Tables (Post-Migration)

After successful migration and frontend updates:

#### 13.1 Create Migration to Remove Old Tables

**File**: `back/db/migrate/XXXXXX_remove_deprecated_topic_tables.rb`

```ruby
class RemoveDeprecatedTopicTables < ActiveRecord::Migration[7.1]
  def change
    # Remove the projects_allowed_input_topics table
    drop_table :projects_allowed_input_topics

    # Remove the ideas_topics table
    drop_table :ideas_topics

    # Remove is_default from topics table
    remove_column :topics, :is_default, :boolean
  end
end
```

---

## API Changes Summary

### New Endpoints

| Endpoint                                  | Method | Description                        |
| ----------------------------------------- | ------ | ---------------------------------- |
| `GET /projects/:project_id/input_topics`  | GET    | List input topics for a project    |
| `POST /projects/:project_id/input_topics` | POST   | Create input topic for project     |
| `GET /input_topics/:id`                   | GET    | Get single input topic             |
| `PATCH /input_topics/:id`                 | PATCH  | Update input topic                 |
| `PATCH /input_topics/:id/reorder`         | PATCH  | Reorder input topic                |
| `DELETE /input_topics/:id`                | DELETE | Delete input topic                 |
| `GET /default_input_topics`               | GET    | List default input topics          |
| `POST /default_input_topics`              | POST   | Create default input topic (admin) |
| `PATCH /default_input_topics/:id`         | PATCH  | Update default input topic (admin) |
| `DELETE /default_input_topics/:id`        | DELETE | Delete default input topic (admin) |

### Modified Endpoints

| Endpoint                        | Changes                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `GET /topics`                   | Remove `ideas_count` sorting, remove `is_default` attribute |
| `POST /topics`                  | Remove `is_default` parameter                               |
| `GET /stats/ideas_by_topic`     | Project-scoped only, uses input_topics                      |
| `GET /stats/comments_by_topic`  | Project-scoped only, uses input_topics                      |
| `GET /stats/reactions_by_topic` | Project-scoped only, uses input_topics                      |
| `POST /ideas`                   | Change `topic_ids` to `input_topic_ids`                     |
| `PATCH /ideas/:id`              | Change `topic_ids` to `input_topic_ids`                     |

### Deprecated Endpoints

| Endpoint                                           | Status                                        |
| -------------------------------------------------- | --------------------------------------------- |
| `GET /projects_allowed_input_topics`               | Deprecated - use `/projects/:id/input_topics` |
| `POST /projects_allowed_input_topics`              | Deprecated - use input topics CRUD            |
| `DELETE /projects_allowed_input_topics/:id`        | Deprecated                                    |
| `PATCH /projects_allowed_input_topics/:id/reorder` | Deprecated                                    |

---

## Testing Strategy

### Unit Tests

1. **InputTopic model tests** - validations, associations, ordering
2. **DefaultInputTopic model tests** - validations, ordering
3. **IdeasInputTopic model tests** - validations, uniqueness
4. **Project#set_default_input_topics! tests** - copying behavior

### Controller Tests

1. **InputTopicsController** - CRUD, authorization, reordering
2. **DefaultInputTopicsController** - admin-only access
3. **StatsControllers** - updated grouping logic

### Integration Tests

1. **Idea submission with input topics**
2. **Project creation with default input topics**
3. **Smart groups with input topics**

### Migration Tests

1. **Data migration rake task** - verify all data migrated correctly
2. **Rollback testing** - ensure safe rollback if needed

---

## Rollout Plan

1. **Phase 1**: Deploy new models and tables (backwards compatible)
2. **Phase 2**: Deploy new API endpoints (InputTopics, DefaultInputTopics)
3. **Phase 3**: Run data migration rake task
4. **Phase 4**: Frontend updates to use new endpoints
5. **Phase 5**: Deprecate old endpoints
6. **Phase 6**: Remove deprecated tables and code

---

## Risks and Mitigations

| Risk                            | Mitigation                                                |
| ------------------------------- | --------------------------------------------------------- |
| Data loss during migration      | Comprehensive backup before migration, dry-run testing    |
| Breaking existing API consumers | Maintain old endpoints during transition period           |
| Smart groups break              | Update rules before migration, test thoroughly            |
| Stats dashboards break          | Update controllers before frontend, test with sample data |
| Analysis engine breaks          | Update auto-tagging method, verify with existing analyses |

---

## Files to Create/Modify

### New Files

- `back/db/migrate/XXXXXX_create_input_topics.rb`
- `back/db/migrate/XXXXXX_create_ideas_input_topics.rb`
- `back/db/migrate/XXXXXX_create_default_input_topics.rb`
- `back/app/models/input_topic.rb`
- `back/app/models/ideas_input_topic.rb`
- `back/app/models/default_input_topic.rb`
- `back/app/controllers/web_api/v1/input_topics_controller.rb`
- `back/app/controllers/web_api/v1/default_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/input_topic_serializer.rb`
- `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`
- `back/app/policies/input_topic_policy.rb`
- `back/app/policies/default_input_topic_policy.rb`
- `back/app/services/side_fx_input_topic_service.rb`
- `back/app/services/side_fx_default_input_topic_service.rb`
- `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`
- `back/spec/models/input_topic_spec.rb`
- `back/spec/models/default_input_topic_spec.rb`
- `back/spec/acceptance/input_topics_spec.rb`
- `back/spec/acceptance/default_input_topics_spec.rb`

### Modified Files

- `back/config/routes.rb`
- `back/app/models/project.rb`
- `back/app/models/idea.rb`
- `back/app/models/topic.rb`
- `back/app/controllers/web_api/v1/topics_controller.rb`
- `back/app/controllers/web_api/v1/stats_ideas_controller.rb`
- `back/app/controllers/web_api/v1/stats_comments_controller.rb`
- `back/app/controllers/web_api/v1/stats_reactions_controller.rb`
- `back/app/services/participants_service.rb`
- `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`
- `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb`
- `back/engines/commercial/public_api/app/controllers/public_api/v2/ideas_controller.rb`
- `back/engines/commercial/public_api/app/finders/public_api/ideas_finder.rb`

### Files to Eventually Remove

- `back/app/models/projects_allowed_input_topic.rb`
- `back/app/models/ideas_topic.rb`
- `back/app/controllers/web_api/v1/projects_allowed_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/projects_allowed_input_topic_serializer.rb`
- `back/app/policies/projects_allowed_input_topic_policy.rb`
- `back/app/services/side_fx_projects_allowed_input_topic_service.rb`
