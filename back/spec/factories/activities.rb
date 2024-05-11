# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    item_type { 'Idea' }
    item_id { SecureRandom.uuid }
    action { 'published' }
    acted_at { Time.now }
    user

    factory :published_activity do
      action { 'published' }
    end

    factory :changed_title_activity do
      action { 'changed_title' }
      payload do
        {
          'change' => [
            { 'en' => 'old title' },
            { 'en' => 'new title' }
          ]
        }
      end
    end

    factory :changed_body_activity do
      action { 'changed_body' }
      payload do
        {
          'change' => [
            { 'en' => 'old body' },
            { 'en' => 'new body' }
          ]
        }
      end
    end

    factory :changed_status_activity do
      action { 'changed_status' }
      payload do
        {
          'change' => %w[
            somepreviousstatusid
            somenewstatusid
          ]
        }
      end
    end

    factory :comment_created_activity do
      association :item, factory: :comment
      action { 'created' }
    end

    factory :idea_published_activity do
      association :item, factory: :idea
      action { 'published' }
    end

    factory :idea_liked_activity do
      association :item, factory: :reaction
      action { 'idea_liked' }
    end

    factory :idea_disliked_activity do
      association :item, factory: :dislike
      action { 'idea_disliked' }
    end

    factory :initiative_published_activity do
      association :item, factory: :initiative
      action { 'published' }
    end

    factory :comment_liked_activity do
      association :item, factory: :comment_reaction
      action { 'comment_liked' }
    end

    factory :admin_rights_given_activity do
      association :item, factory: :admin
      action { 'admin_rights_given' }
    end

    factory :project_created_activity do
      association :item, factory: :project
      action { 'created' }
    end

    # TODO: Add payload to this factory
    factory :project_changed_activity do
      association :item, factory: :project
      action { 'changed' }
    end

    factory :project_deleted_activity do
      association :item, factory: :project
      action { 'deleted' }
    end

    factory :project_published_activity do
      association :item, factory: :project
      action { 'published' }
    end

    # TODO: Add payload to this factory
    factory :project_changed_publication_status_activity do
      association :item, factory: :project
      action { 'changed_publication_status' }
    end

    factory :phase_created_activity do
      association :item, factory: :phase
      action { 'created' }
    end

    # TODO: Add payload to this factory
    factory :phase_changed_activity do
      association :item, factory: :phase
      action { 'changed' }
    end

    factory :phase_deleted_activity do
      association :item, factory: :phase
      action { 'deleted' }
    end
  end
end
