# frozen_string_literal: true

FactoryBot.modify do
  factory :project do
    after(:create) do |project|
      PermissionsService.new.update_permissions_for_scope(project) if PermissionsService.scope_types.include?('Project')
    end
  end
end
