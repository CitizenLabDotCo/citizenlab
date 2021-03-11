# frozen_string_literal: true

FactoryBot.modify do
  factory :project do
    after(:create) do |project|
      require 'pry' ; binding.pry
      PermissionsService.new.update_permissions_for_scope(project)
    end
  end
end
