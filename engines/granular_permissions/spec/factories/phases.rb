# frozen_string_literal: true

FactoryBot.modify do
  factory :phase do
    transient do
      permissions_config { {} }
    end

    after(:create) do |phase, _evaluator|
      PermissionsService.new.update_permissions_for_scope(phase) if PermissionsService.scope_types.include?('Phase')
    end

    after(:create) do |phase, evaluator|
      evaluator.permissions_config.each do |action, is_allowed|
        phase.permissions.find_or_initialize_by(action: action).tap do |permission|
          permission.permitted_by = is_allowed ? 'everyone' : 'admins_moderators'
        end.save!
      end
    end
  end
end
