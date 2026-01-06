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

## Implementation Plan

### Phase 1: Rename Topics to GlobalTopics

**Goal**: Rename the `topics` table and model to `global_topics`/`GlobalTopic` for clarity.

#### 1.1 Create Migration to Rename Tables

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

#### 1.2 Rename Topic Model to GlobalTopic

**File**: `back/app/models/global_topic.rb` (rename from `topic.rb`)

```ruby
class GlobalTopic < ApplicationRecord
  acts_as_list column: :ordering

  has_many :projects_global_topics, dependent: :destroy
  has_many :projects, through: :projects_global_topics
  has_many :static_pages_global_topics, dependent: :destroy
  has_many :static_pages, through: :static_pages_global_topics
  has_many :followers, as: :followable, dependent: :destroy

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }

  scope :order_new, -> { order(created_at: :desc) }
  scope :order_projects_count, (proc do |direction = :desc|
    # ... existing implementation
  end)
end
```

#### 1.3 Rename Join Models

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

#### 1.4 Update Project Model Associations

**File**: `back/app/models/project.rb`

```ruby
has_many :projects_global_topics, dependent: :destroy
has_many :global_topics, -> { order(:ordering) }, through: :projects_global_topics
```

#### 1.5 Update StaticPage Model Associations

**File**: `back/app/models/static_page.rb`

```ruby
has_many :static_pages_global_topics, dependent: :destroy
has_many :global_topics, -> { order(:ordering) }, through: :static_pages_global_topics
```

Update `filter_projects` method to use `global_topics`.

#### 1.6 Update Controllers and Serializers

Rename:

- `TopicsController` → `GlobalTopicsController`
- `TopicSerializer` → `GlobalTopicSerializer`
- `TopicPolicy` → `GlobalTopicPolicy`
- `SideFxTopicService` → `SideFxGlobalTopicService`

Update routes accordingly.

#### 1.7 Update ProjectsFinderService

**File**: `back/app/services/projects_finder_service.rb`

Update the `followed_by_user` method to use new table/column names:

```ruby
.joins(
  'LEFT JOIN global_topics AS followed_global_topics ON followers.followable_type = \'GlobalTopic\' ' \
  'AND followed_global_topics.id = followers.followable_id'
)
.joins('LEFT JOIN projects_global_topics ON projects_global_topics.global_topic_id = followed_global_topics.id')
```

#### 1.8 Update Notifications

**File**: `back/app/models/notifications/project_published.rb`

```ruby
followers = Follower.where(followable: project.global_topics).or(Follower.where(followable: project.areas))
```

---

### Phase 2: Create New InputTopic Model and Table

**Goal**: Create a new `input_topics` table where input topics are stored per-project, separate from global topics.

#### 2.1 Create Migration for `input_topics` Table

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

#### 2.2 Create InputTopic Model

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

#### 2.3 Create Migration for `ideas_input_topics` Join Table

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

#### 2.4 Create IdeasInputTopic Model

**File**: `back/app/models/ideas_input_topic.rb`

```ruby
class IdeasInputTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :input_topic

  validates :input_topic_id, uniqueness: { scope: :idea_id }
end
```

#### 2.5 Create DefaultInputTopic Model

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

### Phase 3: Update Project Model

#### 3.1 Add New Associations to Project

**File**: `back/app/models/project.rb`

Add:

```ruby
has_many :input_topics, -> { order(:ordering) }, dependent: :destroy
```

Replace `set_default_topics!` method:

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

#### 3.2 Update Idea Model

**File**: `back/app/models/idea.rb`

Add new associations alongside existing ones (for transition period):

```ruby
has_many :ideas_input_topics, dependent: :destroy
has_many :input_topics, through: :ideas_input_topics
```

---

### Phase 4: Create InputTopics API

#### 4.1 Create InputTopics Controller

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

#### 4.2 Create InputTopic Serializer

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

#### 4.3 Create InputTopic Policy

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

#### 4.4 Create SideFxInputTopicService

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

#### 4.5 Add Routes

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

### Phase 5: Create DefaultInputTopics API

#### 5.1 Create DefaultInputTopics Controller

**File**: `back/app/controllers/web_api/v1/default_input_topics_controller.rb`

Similar structure to InputTopicsController but for admin-level management of default topics.

#### 5.2 Create DefaultInputTopic Serializer

**File**: `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`

#### 5.3 Create DefaultInputTopic Policy

**File**: `back/app/policies/default_input_topic_policy.rb`

Admin-only CRUD operations.

---

### Phase 6: Update Stats Controllers

#### 6.1 Update Stats Ideas Controller

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

#### 6.2 Update Stats Comments Controller

**File**: `back/app/controllers/web_api/v1/stats_comments_controller.rb`

Update `comments_by_topic_serie` to **require** project_id:

```ruby
def comments_by_topic_serie
  return head :bad_request unless params[:project]
  # ... use input_topics
end
```

#### 6.3 Update Stats Reactions Controller

**File**: `back/app/controllers/web_api/v1/stats_reactions_controller.rb`

Update `reactions_by_topic_serie` to **require** project_id:

```ruby
def reactions_by_topic_serie
  return head :bad_request unless params[:project]
  # ... use input_topics
end
```

---

### Phase 7: Update Idea Submission Flow

#### 7.1 Update Custom Field Handling

**File**: `back/app/models/custom_field.rb`

Keep the `topic_ids` field type name but change underlying behavior to work with `input_topics`:

- When reading `topic_ids`, return the idea's `input_topic_ids`
- When writing `topic_ids`, update the idea's `input_topics` association

#### 7.2 Update Idea Creation/Update

**File**: `back/app/controllers/web_api/v1/ideas_controller.rb`

Keep accepting `topic_ids` parameter but map to input_topics:

```ruby
def idea_params
  # ... existing params
  # topic_ids still accepted but now maps to input_topics
end

# In create/update actions:
def assign_topics(idea, topic_ids)
  return unless topic_ids

  # Validate that provided IDs are valid input_topics for the project
  valid_input_topics = idea.project.input_topics.where(id: topic_ids)
  idea.input_topics = valid_input_topics
end
```

#### 7.3 Update Idea Serializer

**File**: `back/app/serializers/web_api/v1/idea_serializer.rb`

Update to serialize `input_topic_ids` as `topic_ids` for backwards compatibility:

```ruby
attribute :topic_ids do |idea|
  idea.input_topic_ids
end
```

---

### Phase 8: Clean Up GlobalTopic Model

#### 8.1 Update GlobalTopic Model

**File**: `back/app/models/global_topic.rb`

Remove `is_default` attribute handling (no longer needed for global topics).

Remove associations:

- `has_many :projects_allowed_input_topics` (deprecated)
- `has_many :ideas_topics` (move to input_topics)

Keep:

- `has_many :projects_global_topics`
- `has_many :projects`
- `has_many :followers`
- `has_many :static_pages_global_topics`
- `include_in_onboarding` (for global topic following)

#### 8.2 Update GlobalTopics Controller

**File**: `back/app/controllers/web_api/v1/global_topics_controller.rb`

Remove:

- `is_default` attribute handling
- `ideas_count` sorting (no longer applicable)

Keep:

- CRUD for global topics
- `projects_count` sorting
- `for_onboarding` filter
- `for_homepage_filter` filter

---

### Phase 9: Update Following and Notifications

#### 9.1 Project Published Notifications

**File**: `back/app/models/notifications/project_published.rb`

Update to use `global_topics`:

```ruby
followers = Follower.where(followable: project.global_topics).or(Follower.where(followable: project.areas))
```

#### 9.2 Followed Projects

**File**: `back/app/services/projects_finder_service.rb`

Already updated in Phase 1.7 - uses `projects_global_topics` for topic-based project following.

---

### Phase 10: Update Smart Groups

#### 10.1 ParticipatedInTopic Rule

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`

Update the `filter` method to use `InputTopic` instead of `Topic`:

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
  # ... similar for other predicates
  end
end

def description_value(locale)
  if multivalue_predicate?
    value.map do |v|
      InputTopic.find(v).title_multiloc[locale]
    end.join ', '
  else
    InputTopic.find(value).title_multiloc[locale]
  end
end

private

def value_in_topics
  if multivalue_predicate?
    errors.add(:value, :has_invalid_topic) unless (value - InputTopic.ids).empty?
  else
    errors.add(:value, :has_invalid_topic) unless InputTopic.ids.include?(value)
  end
end
```

**Note**: The JSON schema remains unchanged - it will be populated with InputTopic IDs after migration. Disambiguation (showing project name) will be handled in the frontend.

#### 10.2 Follow Rule

**File**: `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/follow.rb`

Update to reference `GlobalTopic`:

```ruby
def followable_type
  case predicate
  when 'is_one_of_topics', 'is_not_topic'
    GlobalTopic
  # ... other cases unchanged
  end
end
```

#### 10.3 Update ParticipantsService

**File**: `back/app/services/participants_service.rb`

Add new method for input topics:

```ruby
def input_topics_participants(input_topics, options = {})
  ideas = Idea.joins(:ideas_input_topics)
              .where(ideas_input_topics: { input_topic_id: input_topics.pluck(:id) })
  ideas_participants(ideas, options)
end
```

---

### Phase 11: Update Analysis Engine

#### 11.1 PlatformTopic Auto-Tagging

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

### Phase 12: Update Public API

#### 12.1 Update Topics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/topics_controller.rb`

Rename to `GlobalTopicsController` and update to use `GlobalTopic` model.

#### 12.2 Add InputTopics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/input_topics_controller.rb`

New endpoint for input topics:

- `GET /api/v2/input_topics` - list all input topics (filterable by project_id)
- `GET /api/v2/input_topics/:id`

#### 12.3 Update IdeaTopics Controller

**File**: `back/engines/commercial/public_api/app/controllers/public_api/v2/idea_topics_controller.rb`

Rename to `IdeaInputTopicsController` and update to use `ideas_input_topics`.

#### 12.4 Update Ideas Finder

**File**: `back/engines/commercial/public_api/app/finders/public_api/ideas_finder.rb`

Update `filter_by_topic_ids` to use `input_topics`:

```ruby
def filter_by_topic_ids(scope)
  return scope unless @topic_ids

  scope
    .joins(:input_topics)
    .where(input_topics: { id: @topic_ids })
    .group('ideas.id')
    .having('COUNT(input_topics.id) = ?', @topic_ids.size)
end
```

---

### Phase 13: Data Migration Rake Task

**File**: `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`

```ruby
namespace :topics do
  desc 'Migrate existing topics data to new input_topics structure'
  task migrate_to_input_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Track mapping from old topic IDs to new input topic IDs (per project)
      topic_to_input_topic_map = {}

      # Step 1: Create default_input_topics from topics marked as default
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
        project.projects_allowed_input_topics.includes(:topic).order(:ordering).each do |pait|
          topic = pait.topic
          input_topic = project.input_topics.create!(
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

      # Step 3: Migrate ideas_topics to ideas_input_topics
      migrated_count = 0
      warning_count = 0
      IdeasTopic.includes(:idea).find_each do |ideas_topic|
        project_id = ideas_topic.idea.project_id
        input_topic_id = topic_to_input_topic_map[[project_id, ideas_topic.topic_id]]

        if input_topic_id
          IdeasInputTopic.create!(
            idea_id: ideas_topic.idea_id,
            input_topic_id: input_topic_id
          )
          migrated_count += 1
        else
          puts "  Warning: No input_topic mapping for idea #{ideas_topic.idea_id}, topic #{ideas_topic.topic_id}"
          warning_count += 1
        end
      end
      puts "  Migrated #{migrated_count} idea-topic associations (#{warning_count} warnings)"

      # Step 4: Migrate smart group rules that reference topics
      # Smart groups store topic IDs in their rules JSON
      Group.where(membership_type: 'rules').find_each do |group|
        next unless group.rules.present?

        rules_updated = false
        updated_rules = group.rules.map do |rule|
          if rule['ruleType'] == 'participated_in_topic' && rule['value'].present?
            # Map old topic IDs to new input topic IDs
            # For participated_in_topic, we need to find ALL input topics that match
            # since the same topic could exist in multiple projects
            old_values = Array(rule['value'])
            new_values = []

            old_values.each do |old_topic_id|
              # Find all input topics created from this topic
              matching_input_topic_ids = topic_to_input_topic_map
                .select { |(_, topic_id), _| topic_id == old_topic_id }
                .values

              if matching_input_topic_ids.any?
                new_values.concat(matching_input_topic_ids)
              else
                puts "  Warning: Smart group #{group.id} references topic #{old_topic_id} with no input topic mapping"
              end
            end

            if new_values.any?
              rules_updated = true
              rule.merge('value' => new_values.uniq)
            else
              rule # Keep original if no mapping found
            end
          elsif rule['ruleType'] == 'follow' && %w[is_one_of_topics is_not_topic].include?(rule['predicate'])
            # Follow rules reference GlobalTopic - no change needed to IDs
            # but we should verify the topics still exist
            rule
          else
            rule
          end
        end

        if rules_updated
          group.update!(rules: updated_rules)
          puts "  Updated smart group #{group.id} with new input topic IDs"
        end
      end

      # Step 5: Migrate analysis tags that reference platform topics
      if defined?(Analysis::Tag)
        Analysis::Tag.where(tag_type: 'platform_topic').find_each do |tag|
          # The tag name is the topic title, so no ID migration needed
          # But we may want to update the tag_type or add metadata
          # This is informational - the analysis engine will need updates
          puts "  Note: Analysis tag '#{tag.name}' may need review"
        end
      end

      # Step 6: Clean up topics that were only used as input topics
      # (not in projects_global_topics and not in static_pages_global_topics)
      # Note: Do NOT delete topics that are followed or used in onboarding
      orphaned_topics = GlobalTopic
        .left_joins(:projects_global_topics, :static_pages_global_topics, :followers)
        .where(projects_global_topics: { id: nil })
        .where(static_pages_global_topics: { id: nil })
        .where(followers: { id: nil })
        .where(include_in_onboarding: false)

      orphan_count = orphaned_topics.count
      orphaned_topics.destroy_all
      puts "  Removed #{orphan_count} orphaned global topics"

      puts "Completed migration for tenant: #{tenant.host}"
      puts "---"
    end
  end
end
```

---

### Phase 14: Deprecate Old Tables (Post-Migration)

After successful migration and frontend updates:

#### 14.1 Create Migration to Remove Old Tables

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

### Renamed Endpoints

| Old Endpoint         | New Endpoint                |
| -------------------- | --------------------------- |
| `GET /topics`        | `GET /global_topics`        |
| `POST /topics`       | `POST /global_topics`       |
| `PATCH /topics/:id`  | `PATCH /global_topics/:id`  |
| `DELETE /topics/:id` | `DELETE /global_topics/:id` |

### Modified Endpoints

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
5. **GlobalTopic model tests** - updated associations

### Controller Tests

1. **InputTopicsController** - CRUD, authorization, reordering
2. **DefaultInputTopicsController** - admin-only access
3. **GlobalTopicsController** - renamed from TopicsController
4. **StatsControllers** - verify project_id is required, updated grouping logic

### Integration Tests

1. **Idea submission with input topics** (using `topic_ids` param)
2. **Project creation with default input topics**
3. **Smart groups with input topics**
4. **Following global topics for project notifications**

### Migration Tests

1. **Data migration rake task** - verify all data migrated correctly
2. **Smart group rules migration** - verify topic IDs updated
3. **Rollback testing** - ensure safe rollback if needed

---

## Rollout Plan

1. **Phase 1**: Deploy table rename and new models (backwards compatible)
2. **Phase 2**: Deploy new API endpoints (InputTopics, DefaultInputTopics)
3. **Phase 3**: Run data migration rake task
4. **Phase 4**: Frontend updates to use new endpoints
5. **Phase 5**: Deprecate old endpoints
6. **Phase 6**: Remove deprecated tables and code

---

## Risks and Mitigations

| Risk                            | Mitigation                                                  |
| ------------------------------- | ----------------------------------------------------------- |
| Data loss during migration      | Comprehensive backup before migration, dry-run testing      |
| Breaking existing API consumers | Maintain `topic_ids` param name for backwards compatibility |
| Smart groups break              | Migrate rule data as part of rake task, test thoroughly     |
| Polymorphic followers break     | Update `followable_type` in migration                       |
| Stats dashboards break          | Update controllers before frontend, test with sample data   |
| Analysis engine breaks          | Update auto-tagging method, verify with existing analyses   |

---

## Files to Create/Modify

### New Files

- `back/db/migrate/XXXXXX_rename_topics_to_global_topics.rb`
- `back/db/migrate/XXXXXX_create_input_topics.rb`
- `back/db/migrate/XXXXXX_create_ideas_input_topics.rb`
- `back/db/migrate/XXXXXX_create_default_input_topics.rb`
- `back/app/models/global_topic.rb`
- `back/app/models/projects_global_topic.rb`
- `back/app/models/static_pages_global_topic.rb`
- `back/app/models/input_topic.rb`
- `back/app/models/ideas_input_topic.rb`
- `back/app/models/default_input_topic.rb`
- `back/app/controllers/web_api/v1/global_topics_controller.rb`
- `back/app/controllers/web_api/v1/input_topics_controller.rb`
- `back/app/controllers/web_api/v1/default_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/global_topic_serializer.rb`
- `back/app/serializers/web_api/v1/input_topic_serializer.rb`
- `back/app/serializers/web_api/v1/default_input_topic_serializer.rb`
- `back/app/policies/global_topic_policy.rb`
- `back/app/policies/input_topic_policy.rb`
- `back/app/policies/default_input_topic_policy.rb`
- `back/app/services/side_fx_global_topic_service.rb`
- `back/app/services/side_fx_input_topic_service.rb`
- `back/app/services/side_fx_default_input_topic_service.rb`
- `back/lib/tasks/single_use/migrate_topics_to_input_topics.rake`
- `back/spec/models/global_topic_spec.rb`
- `back/spec/models/input_topic_spec.rb`
- `back/spec/models/default_input_topic_spec.rb`
- `back/spec/acceptance/global_topics_spec.rb`
- `back/spec/acceptance/input_topics_spec.rb`
- `back/spec/acceptance/default_input_topics_spec.rb`

### Modified Files

- `back/config/routes.rb`
- `back/app/models/project.rb`
- `back/app/models/idea.rb`
- `back/app/models/static_page.rb`
- `back/app/models/follower.rb` (if needed for type references)
- `back/app/controllers/web_api/v1/ideas_controller.rb`
- `back/app/serializers/web_api/v1/idea_serializer.rb`
- `back/app/controllers/web_api/v1/stats_ideas_controller.rb`
- `back/app/controllers/web_api/v1/stats_comments_controller.rb`
- `back/app/controllers/web_api/v1/stats_reactions_controller.rb`
- `back/app/services/projects_finder_service.rb`
- `back/app/services/participants_service.rb`
- `back/app/models/notifications/project_published.rb`
- `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/participated_in_topic.rb`
- `back/engines/commercial/smart_groups/app/lib/smart_groups/rules/follow.rb`
- `back/engines/commercial/analysis/app/lib/analysis/auto_tagging_method/platform_topic.rb`
- `back/engines/commercial/public_api/app/controllers/public_api/v2/topics_controller.rb`
- `back/engines/commercial/public_api/app/controllers/public_api/v2/idea_topics_controller.rb`
- `back/engines/commercial/public_api/app/finders/public_api/ideas_finder.rb`

### Files to Eventually Remove

- `back/app/models/topic.rb`
- `back/app/models/projects_topic.rb`
- `back/app/models/static_pages_topic.rb`
- `back/app/models/projects_allowed_input_topic.rb`
- `back/app/models/ideas_topic.rb`
- `back/app/controllers/web_api/v1/topics_controller.rb`
- `back/app/controllers/web_api/v1/projects_allowed_input_topics_controller.rb`
- `back/app/serializers/web_api/v1/topic_serializer.rb`
- `back/app/serializers/web_api/v1/projects_allowed_input_topic_serializer.rb`
- `back/app/policies/topic_policy.rb`
- `back/app/policies/projects_allowed_input_topic_policy.rb`
- `back/app/services/side_fx_topic_service.rb`
- `back/app/services/side_fx_projects_allowed_input_topic_service.rb`
