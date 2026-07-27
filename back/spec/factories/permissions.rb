# frozen_string_literal: true

FactoryBot.define do
  factory :permission do
    action { 'posting_idea' }
    permitted_by { 'users' }
    global_custom_fields { false }
    permission_scope { create(:single_phase_ideation_project).phases.first }
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

    # The 'everyone_confirmed_email' permitted_by no longer exists; it is now
    # represented as a 'users' permission that only requires a confirmed email.
    trait :by_everyone_confirmed_email do
      permitted_by { 'users' }
      require_confirmed_email { true }
      require_name { false }
      require_password { false }
    end

    # The 'verified' permitted_by no longer exists; it is now represented as a
    # 'users' permission that additionally requires verification.
    trait :by_verified do
      permitted_by { 'users' }
      require_verification { true }
      require_confirmed_email { false }
      require_name { false }
      require_password { false }
    end

    factory :global_permission do
      permission_scope_id { nil }
      permission_scope_type { nil }

      permitted_by { 'users' }
      groups { [] }
    end
  end
end
