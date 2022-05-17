# frozen_string_literal: true

FactoryBot.define do
  factory :permission do
    action { 'posting_idea' }
    permitted_by { 'groups' }
    permission_scope { create(:continuous_project, participation_method: 'ideation') }
    groups { [] }

    trait :by_everyone do
      permitted_by { 'everyone' }
    end

    trait :by_admins_moderators do
      permitted_by { 'admins_moderators' }
    end

    trait :by_users do
      permitted_by { 'users' }
    end

    factory :global_permission do
      permission_scope_id { nil }
      permission_scope_type { nil }

      permitted_by { 'users' }
      groups { [] }
    end
  end
end
