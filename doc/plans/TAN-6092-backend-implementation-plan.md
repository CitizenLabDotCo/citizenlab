# Backend Implementation Plan: Split Global and Input Topics

## Overview

This plan details the backend changes required to split Global topics (use case A - categorizing projects) from Input topics (use case B - tagging ideas). After this change:

- **Global topics** remain platform-level and are used to categorize projects (renamed from "Project topics")
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
- Topics have `followers` (polymorphic - `followable_type: 'Topic'`)
- `Topic.defaults` scope returns topics with `is_default: true`

### Key Behaviors

- `Project#set_default_topics!` assigns `Topic.defaults` as `allowed_input_topics`
- Following a topic leads to notifications when projects with that topic are published (uses `projects_topics` - use case A)
- Stats (ideas_by_topic, etc.) group by `ideas_topics` (use case B)

---

## Rollout Strategy

The implementation is split into **two releases** to minimize risk:

### Release 1: Rename + Add Tables + Data Migration

**Goal**: Rename Topic → GlobalTopic throughout the codebase, add new InputTopic/DefaultInputTopic tables, and copy data. The product continues working exactly as before - no functional changes.

Contents:

- Rename `topics` table and model to `global_topics`/`GlobalTopic`
- Rename all join tables and associations
- Update all references in backend AND frontend
- Add new `input_topics`, `ideas_input_topics`, `default_input_topics` tables (empty, unused)
- Add new models (InputTopic, IdeasInputTopic, DefaultInputTopic)
- Write and run data migration rake task to populate new tables
- **Do NOT delete any existing data** - old tables remain functional

### Release 2: Switch to InputTopics

**Goal**: After Release 1 is deployed and data migrations run, switch the actual logic to use InputTopic instead of GlobalTopic where appropriate.

Contents:

- Replace GlobalTopic usage with InputTopic for idea tagging
- Create new API endpoints for InputTopics and DefaultInputTopics
- Update stats controllers to use input_topics
- Update idea submission flow
- Update smart groups, analysis engine, public API
- Remove deprecated tables and columns

---

# RELEASE 1: Rename + Add Tables + Data Migration

## Phase 1.1: Create Migration to Rename Tables

**File**: `back/db/migrate/XXXXXX_rename_topics_to_global_topics.rb`

```ruby
class RenameTopicsToGlobalTopics < ActiveRecord::Migration[7.1]
  def change
    # Rename main table
    rename_table :topics, :global_topics

    # Rename join tables
    rename_table :projects_topics, :projects_global_topics
    rename_table :static_pages_topics, :static_pages_global_topics

    # Update foreign key column names in join tables
    rename_column :projects_global_topics, :topic_id, :global_topic_id
    rename_column :static_pages_global_topics, :topic_id, :global_topic_id

    # Update polymorphic followers
    execute <<-SQL
      UPDATE followers SET followable_type = 'GlobalTopic' WHERE followable_type = 'Topic'
    SQL
  end
end
```

## Phase 1.2: Rename Topic Model to GlobalTopic

**File**: `back/app/models/global_topic.rb` (rename from `topic.rb`)

```ruby
class GlobalTopic < ApplicationRecord
  acts_as_list column: :ordering

  has_many :projects_global_topics, dependent: :destroy
  has_many :projects, through: :projects_global_topics
  has_many :static_pages_global_topics, dependent: :destroy
  has_many :static_pages, through: :static_pages_global_topics
  has_many :followers, as: :followable, dependent: :destroy

  # KEEP these associations during Release 1 - they still work!
  has_many :projects_allowed_input_topics, foreign_key: :topic_id, dependent: :destroy
  has_many :allowed_input_topics_projects, through: :projects_allowed_input_topics, source: :project
  has_many :ideas_topics, foreign_key: :topic_id, dependent: :destroy
  has_many :ideas, through: :ideas_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }

  scope :defaults, -> { where(is_default: true) }
  scope :order_new, -> { order(created_at: :desc) }
  scope :order_projects_count, (proc do |direction = :desc|
    # ... existing implementation
  end)
end
```

**Note**: The GlobalTopic model retains the associations to `projects_allowed_input_topics` and `ideas_topics` during Release 1, since those tables still use `topic_id` as the foreign key and the product needs to keep working.

## Phase 1.3: Rename Join Models

**File**: `back/app/models/projects_global_topic.rb` (rename from `projects_topic.rb`)

```ruby
class ProjectsGlobalTopic < ApplicationRecord
  belongs_to :project
  belongs_to :global_topic
end
```

**File**: `back/app/models/static_pages_global_topic.rb` (rename from `static_pages_topic.rb`)

```ruby
class StaticPagesGlobalTopic < ApplicationRecord
  belongs_to :static_page
  belongs_to :global_topic
end
```

## Phase 1.4: Update Project Model Associations

**File**: `back/app/models/project.rb`

Rename associations but keep both use cases working:

```ruby
# Use case A - Project categorization (renamed)
has_many :projects_global_topics, dependent: :destroy
has_many :global_topics, -> { order(:ordering) }, through: :projects_global_topics

# Use case B - Input topics (KEEP working during Release 1)
has_many :projects_allowed_input_topics, dependent: :destroy
has_many :allowed_input_topics, through: :projects_allowed_input_topics, source: :global_topic
```

**Note**: The `allowed_input_topics` association now points to `global_topic` (was `topic`), but functionally works the same since the table was renamed.

## Phase 1.5: Update StaticPage Model Associations

**File**: `back/app/models/static_page.rb`

```ruby
has_many :static_pages_global_topics, dependent: :destroy
has_many :global_topics, -> { order(:ordering) }, through: :static_pages_global_topics
```

Update `filter_projects` method to use `global_topics`.

## Phase 1.6: Update Controllers, Serializers, Policies, Services

Rename (keeping same functionality):

| Old                  | New                        |
| -------------------- | -------------------------- |
| `TopicsController`   | `GlobalTopicsController`   |
| `TopicSerializer`    | `GlobalTopicSerializer`    |
| `TopicPolicy`        | `GlobalTopicPolicy`        |
| `SideFxTopicService` | `SideFxGlobalTopicService` |

Update routes to use `/global_topics` instead of `/topics`.

**Important**: The `ProjectsAllowedInputTopicsController` and related files remain unchanged during Release 1 - they continue to work with the renamed `GlobalTopic` model.

## Phase 1.7: Update All Backend References

Update all files that reference `Topic` to use `GlobalTopic`:

- `back/app/services/projects_finder_service.rb` - Update SQL joins to use `global_topics`, `projects_global_topics`
- `back/app/models/notifications/project_published.rb` - Use `project.global_topics`
- `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/follow.rb` - Reference `GlobalTopic`
- `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb` - Reference `GlobalTopic` (still works via `ideas_topics`)
- `back/app/services/participants_service.rb` - Update method references
- `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb` - Use `GlobalTopic`
- `back/engines/commercial/public_api/` - Update all topic references

## Phase 1.8: Update Frontend References

Update all frontend files that reference topics:

- API hooks: rename `useTopics` → `useGlobalTopics`, etc.
- Update API endpoints from `/topics` to `/global_topics`
- Update TypeScript types
- Update components that use topics

**The product should work exactly as before after Release 1 - just with renamed types/endpoints.**

---

## Phase 1.9: Create New Tables (Empty)

Add the new tables that will be used in Release 2. They remain empty during Release 1.

### 1.9.1 Create Migration for `input_topics` Table

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

### 1.9.2 Create Migration for `ideas_input_topics` Join Table

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

### 1.9.3 Create Migration for `default_input_topics` Table

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

## Phase 1.10: Create New Models (Unused)

Create the models but don't integrate them into the application logic yet.

### 1.10.1 InputTopic Model

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

### 1.10.2 IdeasInputTopic Model

**File**: `back/app/models/ideas_input_topic.rb`

```ruby
class IdeasInputTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :input_topic

  validates :input_topic_id, uniqueness: { scope: :idea_id }
end
```

### 1.10.3 DefaultInputTopic Model

**File**: `back/app/models/default_input_topic.rb`

```ruby
class DefaultInputTopic < ApplicationRecord
  acts_as_list column: :ordering

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
end
```

---

## Phase 1.11: Data Migration Rake Task

**File**: `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`

This task copies data from the old structure to the new structure. It does NOT delete any data - the old tables remain fully functional.

```ruby
namespace :topics do
  desc 'Copy existing topics data to new input_topics structure (non-destructive)'
  task migrate_to_input_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Track mapping from old topic IDs to new input topic IDs (per project)
      topic_to_input_topic_map = {}

      # Step 1: Create default_input_topics from global_topics marked as default
      GlobalTopic.where(is_default: true).order(:ordering).find_each do |topic|
        DefaultInputTopic.create!(
          title_multiloc: topic.title_multiloc,
          description_multiloc: topic.description_multiloc,
          icon: topic.icon,
          ordering: topic.ordering
        )
      end
      puts "  Created #{DefaultInputTopic.count} default input topics"

      # Step 2: For each project, create input_topics from projects_allowed_input_topics
      Project.find_each do |project|
        project.projects_allowed_input_topics.includes(:global_topic).order(:ordering).each do |pait|
          topic = pait.global_topic
          next unless topic # Skip if topic was deleted

          input_topic = InputTopic.create!(
            project: project,
            title_multiloc: topic.title_multiloc,
            description_multiloc: topic.description_multiloc,
            icon: topic.icon,
            ordering: pait.ordering
          )

          # Map old topic to new input_topic for ideas migration
          topic_to_input_topic_map[[project.id, topic.id]] = input_topic.id
        end
      end
      puts "  Created input topics for #{Project.count} projects"

      # Step 3: Copy ideas_topics to ideas_input_topics
      migrated_count = 0
      warning_count = 0
      IdeasTopic.includes(:idea).find_each do |ideas_topic|
        project_id = ideas_topic.idea&.project_id
        next unless project_id # Skip orphaned records

        input_topic_id = topic_to_input_topic_map[[project_id, ideas_topic.topic_id]]

        if input_topic_id
          IdeasInputTopic.find_or_create_by!(
            idea_id: ideas_topic.idea_id,
            input_topic_id: input_topic_id
          )
          migrated_count += 1
        else
          puts "  Warning: No input_topic mapping for idea #{ideas_topic.idea_id}, topic #{ideas_topic.topic_id}"
          warning_count += 1
        end
      end
      puts "  Copied #{migrated_count} idea-topic associations (#{warning_count} warnings)"

      # Step 4: Prepare smart group rules migration mapping (for Release 2)
      # Store the mapping for later use - don't modify groups yet
      mapping_file = Rails.root.join('tmp', "topic_mapping_#{tenant.id}.json")
      File.write(mapping_file, topic_to_input_topic_map.transform_keys { |k| k.join(':') }.to_json)
      puts "  Saved topic mapping to #{mapping_file}"

      puts "Completed data copy for tenant: #{tenant.host}"
      puts "---"
    end
  end
end
```

---

## Release 1 Summary

After Release 1:

| What                                  | Status                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| `topics` table                        | Renamed to `global_topics`                                       |
| `projects_topics` table               | Renamed to `projects_global_topics`                              |
| `static_pages_topics` table           | Renamed to `static_pages_global_topics`                          |
| `projects_allowed_input_topics` table | **Unchanged** - still works with `topic_id` → `global_topics.id` |
| `ideas_topics` table                  | **Unchanged** - still works with `topic_id` → `global_topics.id` |
| `input_topics` table                  | **New, populated with copies**                                   |
| `ideas_input_topics` table            | **New, populated with copies**                                   |
| `default_input_topics` table          | **New, populated with copies**                                   |
| Product functionality                 | **Unchanged** - works exactly as before                          |

---

# RELEASE 2: Switch to InputTopics

**Prerequisite**: Release 1 must be deployed and data migrations must be run first.

## Phase 2.1: Update Project Model

**File**: `back/app/models/project.rb`

Add InputTopic associations and update the set_default method:

```ruby
# NEW: Input topics (project-level)
has_many :input_topics, -> { order(:ordering) }, dependent: :destroy

# Replace set_default_topics! with set_default_input_topics!
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

## Phase 2.2: Update Idea Model

**File**: `back/app/models/idea.rb`

Add InputTopic associations:

```ruby
has_many :ideas_input_topics, dependent: :destroy
has_many :input_topics, through: :ideas_input_topics
```

## Phase 2.3: Create InputTopics API

### Controller

**File**: `back/app/controllers/web_api/v1/input_topics_controller.rb`

```ruby
module WebApi
  module V1
    class InputTopicsController < ApplicationController
      before_action :set_project, only: [:index, :create]
      before_action :set_input_topic, only: [:show, :update, :destroy, :reorder]

      def index
        @input_topics = policy_scope(InputTopic)
          .where(project: @project)
          .order(:ordering)
        render json: linked_json(@input_topics, WebApi::V1::InputTopicSerializer, params: jsonapi_params)
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

### Serializer

**File**: `back/app/serializers/web_api/v1/input_topic_serializer.rb`

```ruby
class WebApi::V1::InputTopicSerializer
  include JSONAPI::Serializer

  attributes :title_multiloc, :description_multiloc, :icon, :ordering, :created_at, :updated_at

  belongs_to :project
end
```

### Policy

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

### Service

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

### Routes

**File**: `back/config/routes.rb`

```ruby
resources :projects do
  resources :input_topics, controller: 'web_api/v1/input_topics', only: [:index, :create]
end

resources :input_topics, controller: 'web_api/v1/input_topics', only: [:show, :update, :destroy] do
  patch :reorder, on: :member
end
```

## Phase 2.4: Create DefaultInputTopics API

Similar structure to InputTopicsController but for admin-level management of default topics.

**File**: `back/app/controllers/web_api/v1/default_input_topics_controller.rb`
**File**: `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`
**File**: `back/app/policies/default_input_topic_policy.rb` (Admin-only CRUD)
**File**: `back/app/services/side_fx_default_input_topic_service.rb`

## Phase 2.5: Update Stats Controllers

### Stats Ideas Controller

**File**: `back/app/controllers/web_api/v1/stats_ideas_controller.rb`

Update `ideas_by_topic_serie` to **require** project_id and use input_topics:

```ruby
def ideas_by_topic_serie
  # Require project_id - no longer support global topic stats
  return head :bad_request unless params[:project]

  ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
  ideas = apply_project_filter(ideas)

  ideas
    .joins(:ideas_input_topics)
    .group('ideas_input_topics.input_topic_id')
    .order('ideas_input_topics.input_topic_id')
    .count
end
```

### Stats Comments Controller

**File**: `back/app/controllers/web_api/v1/stats_comments_controller.rb`

Update `comments_by_topic_serie` to **require** project_id and use input_topics.

### Stats Reactions Controller

**File**: `back/app/controllers/web_api/v1/stats_reactions_controller.rb`

Update `reactions_by_topic_serie` to **require** project_id and use input_topics.

## Phase 2.6: Update Idea Submission Flow

### Custom Field Handling

**File**: `back/app/models/custom_field.rb`

Keep the `topic_ids` field type name but change underlying behavior to work with `input_topics`.

### Idea Creation/Update

**File**: `back/app/controllers/web_api/v1/ideas_controller.rb`

Keep accepting `topic_ids` parameter but map to input_topics:

```ruby
def assign_topics(idea, topic_ids)
  return unless topic_ids

  # Validate that provided IDs are valid input_topics for the project
  valid_input_topics = idea.project.input_topics.where(id: topic_ids)
  idea.input_topics = valid_input_topics
end
```

### Idea Serializer

**File**: `back/app/serializers/web_api/v1/idea_serializer.rb`

Update to serialize `input_topic_ids` as `topic_ids` for backwards compatibility:

```ruby
attribute :topic_ids do |idea|
  idea.input_topic_ids
end
```

## Phase 2.7: Clean Up GlobalTopic Model

**File**: `back/app/models/global_topic.rb`

Remove associations that are no longer needed:

```ruby
# REMOVE these associations
# has_many :projects_allowed_input_topics
# has_many :ideas_topics

# KEEP these
has_many :projects_global_topics, dependent: :destroy
has_many :projects, through: :projects_global_topics
has_many :static_pages_global_topics, dependent: :destroy
has_many :static_pages, through: :static_pages_global_topics
has_many :followers, as: :followable, dependent: :destroy
```

**File**: `back/app/controllers/web_api/v1/global_topics_controller.rb`

Remove:

- `is_default` attribute handling
- `ideas_count` sorting (no longer applicable)

## Phase 2.8: Update Smart Groups

### ParticipatedInTopic Rule

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`

Update to use `InputTopic`:

```ruby
def filter(users_scope)
  participants_service = ParticipantsService.new

  case predicate
  when 'in'
    participants = participants_service.input_topics_participants(InputTopic.where(id: value))
    users_scope.where(id: participants)
  when 'not_in'
    participants = participants_service.input_topics_participants(InputTopic.where(id: value))
    users_scope.where.not(id: participants)
  end
end
```

### Smart Group Data Migration

Run a rake task to update smart group rules with the mapping created in Release 1:

```ruby
namespace :topics do
  desc 'Update smart group rules to use new input topic IDs'
  task migrate_smart_group_rules: :environment do
    Tenant.safe_switch_each do |tenant|
      mapping_file = Rails.root.join('tmp', "topic_mapping_#{tenant.id}.json")
      next unless File.exist?(mapping_file)

      mapping = JSON.parse(File.read(mapping_file))
        .transform_keys { |k| k.split(':').map(&:to_s) }

      Group.where(membership_type: 'rules').find_each do |group|
        # ... update rules using mapping
      end
    end
  end
end
```

### ParticipantsService

**File**: `back/app/services/participants_service.rb`

Add new method:

```ruby
def input_topics_participants(input_topics, options = {})
  ideas = Idea.joins(:ideas_input_topics)
              .where(ideas_input_topics: { input_topic_id: input_topics.pluck(:id) })
  ideas_participants(ideas, options)
end
```

## Phase 2.9: Update Analysis Engine

**File**: `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb`

Update to use `ideas_input_topics`:

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

## Phase 2.10: Update Public API

- Rename `TopicsController` → `GlobalTopicsController`
- Add new `InputTopicsController`
- Rename `IdeaTopicsController` → `IdeaInputTopicsController`
- Update `IdeasFinder` to use `input_topics`

## Phase 2.11: Deprecate Old Tables

**File**: `back/db/migrate/XXXXXX_remove_deprecated_topic_tables.rb`

```ruby
class RemoveDeprecatedTopicTables < ActiveRecord::Migration[7.1]
  def change
    # Remove the projects_allowed_input_topics table
    drop_table :projects_allowed_input_topics

    # Remove the ideas_topics table
    drop_table :ideas_topics

    # Remove is_default from global_topics table
    remove_column :global_topics, :is_default, :boolean
  end
end
```

## Phase 2.12: Remove Deprecated Code

Remove files:

- `back/app/models/projects_allowed_input_topic.rb`
- `back/app/models/ideas_topic.rb`
- `back/app/controllers/web_api/v1/projects_allowed_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/projects_allowed_input_topic_serializer.rb`
- `back/app/policies/projects_allowed_input_topic_policy.rb`
- `back/app/services/side_fx_projects_allowed_input_topic_service.rb`

Remove deprecated associations from `GlobalTopic` model.

---

## API Changes Summary

### New Endpoints (Release 2)

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

### Renamed Endpoints (Release 1)

| Old Endpoint         | New Endpoint                |
| -------------------- | --------------------------- |
| `GET /topics`        | `GET /global_topics`        |
| `POST /topics`       | `POST /global_topics`       |
| `PATCH /topics/:id`  | `PATCH /global_topics/:id`  |
| `DELETE /topics/:id` | `DELETE /global_topics/:id` |

### Modified Endpoints (Release 2)

| Endpoint                        | Changes                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `GET /global_topics`            | Remove `ideas_count` sorting, remove `is_default` attribute |
| `POST /global_topics`           | Remove `is_default` parameter                               |
| `GET /stats/ideas_by_topic`     | **Requires** `project` param, uses input_topics             |
| `GET /stats/comments_by_topic`  | **Requires** `project` param, uses input_topics             |
| `GET /stats/reactions_by_topic` | **Requires** `project` param, uses input_topics             |
| `POST /ideas`                   | `topic_ids` param now maps to input_topics                  |
| `PATCH /ideas/:id`              | `topic_ids` param now maps to input_topics                  |
| `GET /ideas/:id`                | `topic_ids` response now returns input_topic IDs            |

### Deprecated Endpoints (Release 2)

| Endpoint                                           | Status                                        |
| -------------------------------------------------- | --------------------------------------------- |
| `GET /projects_allowed_input_topics`               | Deprecated - use `/projects/:id/input_topics` |
| `POST /projects_allowed_input_topics`              | Deprecated - use input topics CRUD            |
| `DELETE /projects_allowed_input_topics/:id`        | Deprecated                                    |
| `PATCH /projects_allowed_input_topics/:id/reorder` | Deprecated                                    |

---

## Testing Strategy

### Release 1 Tests

1. **Rename verification** - All existing tests should pass with renamed models
2. **Data migration** - Verify data is copied correctly to new tables
3. **No functional changes** - Product works exactly as before

### Release 2 Tests

1. **InputTopic model tests** - validations, associations, ordering
2. **DefaultInputTopic model tests** - validations, ordering
3. **IdeasInputTopic model tests** - validations, uniqueness
4. **Project#set_default_input_topics! tests** - copying behavior
5. **InputTopicsController** - CRUD, authorization, reordering
6. **DefaultInputTopicsController** - admin-only access
7. **StatsControllers** - verify project_id is required
8. **Idea submission with input topics**
9. **Smart groups with input topics**
10. **Following global topics for project notifications**

---

## Risks and Mitigations

| Risk                            | Mitigation                                                 |
| ------------------------------- | ---------------------------------------------------------- |
| Data loss during migration      | Non-destructive copy in Release 1, backup before Release 2 |
| Breaking existing API consumers | Release 1 renames first, Release 2 adds new functionality  |
| Smart groups break              | Mapping stored in Release 1, applied in Release 2          |
| Polymorphic followers break     | Updated in Release 1 migration                             |
| Stats dashboards break          | Updated in Release 2 with frontend coordination            |

---

## Files Summary

### Release 1: New Files

- `back/db/migrate/XXXXXX_rename_topics_to_global_topics.rb`
- `back/db/migrate/XXXXXX_create_input_topics.rb`
- `back/db/migrate/XXXXXX_create_ideas_input_topics.rb`
- `back/db/migrate/XXXXXX_create_default_input_topics.rb`
- `back/app/models/global_topic.rb` (renamed from `topic.rb`)
- `back/app/models/projects_global_topic.rb` (renamed from `projects_topic.rb`)
- `back/app/models/static_pages_global_topic.rb` (renamed from `static_pages_topic.rb`)
- `back/app/models/input_topic.rb`
- `back/app/models/ideas_input_topic.rb`
- `back/app/models/default_input_topic.rb`
- `back/app/controllers/web_api/v1/global_topics_controller.rb` (renamed)
- `back/app/serializers/web_api/v1/global_topic_serializer.rb` (renamed)
- `back/app/policies/global_topic_policy.rb` (renamed)
- `back/app/services/side_fx_global_topic_service.rb` (renamed)
- `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`

### Release 1: Modified Files (Rename References)

- All backend files referencing `Topic` → `GlobalTopic`
- All frontend files referencing `topics` → `global_topics`
- `back/config/routes.rb`

### Release 2: New Files

- `back/app/controllers/web_api/v1/input_topics_controller.rb`
- `back/app/controllers/web_api/v1/default_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/input_topic_serializer.rb`
- `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`
- `back/app/policies/input_topic_policy.rb`
- `back/app/policies/default_input_topic_policy.rb`
- `back/app/services/side_fx_input_topic_service.rb`
- `back/app/services/side_fx_default_input_topic_service.rb`
- `back/db/migrate/XXXXXX_remove_deprecated_topic_tables.rb`

### Release 2: Modified Files

- `back/app/models/project.rb`
- `back/app/models/idea.rb`
- `back/app/models/global_topic.rb`
- `back/app/controllers/web_api/v1/ideas_controller.rb`
- `back/app/serializers/web_api/v1/idea_serializer.rb`
- `back/app/controllers/web_api/v1/stats_ideas_controller.rb`
- `back/app/controllers/web_api/v1/stats_comments_controller.rb`
- `back/app/controllers/web_api/v1/stats_reactions_controller.rb`
- `back/app/services/participants_service.rb`
- Smart groups rules files
- Analysis engine files
- Public API files

### Release 2: Files to Remove

- `back/app/models/projects_allowed_input_topic.rb`
- `back/app/models/ideas_topic.rb`
- `back/app/controllers/web_api/v1/projects_allowed_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/projects_allowed_input_topic_serializer.rb`
- `back/app/policies/projects_allowed_input_topic_policy.rb`
- `back/app/services/side_fx_projects_allowed_input_topic_service.rb`
