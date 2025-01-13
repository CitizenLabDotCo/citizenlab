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

    factory :idea_created_activity do
      association :item, factory: :idea
      action { 'created' }
    end

    factory :idea_changed_activity do
      action { 'changed' }
    end

    factory :idea_deleted_activity do
      association :item, factory: :idea
      action { 'deleted' }
      payload do
        {
          idea: {
            id: SecureRandom.uuid,
            title_multiloc: { 'en' => 'title' },
            body_multiloc: { 'en' => 'body' }
          }
        }
      end
    end

    factory :idea_changed_status_activity do
      action { 'changed_status' }
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

    factory :project_changed_activity do
      association :item, factory: :project
      action { 'changed' }
    end

    factory :project_deleted_activity do
      association :item, factory: :project
      action { 'deleted' }
      payload do
        {
          project: {
            id: SecureRandom.uuid,
            title_multiloc: { 'en' => 'title' },
            body_multiloc: { 'en' => 'body' }
          }
        }
      end
    end

    factory :project_published_activity do
      association :item, factory: :project
      action { 'published' }
    end

    factory :phase_created_activity do
      association :item, factory: :phase
      action { 'created' }
    end

    factory :phase_changed_activity do
      association :item, factory: :phase
      action { 'changed' }
    end

    factory :phase_deleted_activity do
      association :item, factory: :phase
      action { 'deleted' }
      payload do
        {
          phase: {
            id: SecureRandom.uuid,
            title_multiloc: { 'en' => 'title' },
            body_multiloc: { 'en' => 'body' }
          }
        }
      end
    end

    factory :project_folder_created_activity do
      association :item, factory: :project_folder
      action { 'created' }
    end

    factory :project_folder_changed_activity do
      association :item, factory: :project_folder
      action { 'changed' }
    end

    factory :project_folder_deleted_activity do
      association :item, factory: :project_folder
      action { 'deleted' }
      payload do
        {
          project_folder: {
            id: SecureRandom.uuid,
            title_multiloc: { 'en' => 'title' },
            body_multiloc: { 'en' => 'body' }
          }
        }
      end
    end
  end
end
