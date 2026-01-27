# frozen_string_literal: true

FactoryBot.define do
  # This factory fails when:
  # - the `participation_location_tracking` feature is enabled, and
  # - Current.location_headers is set.
  #
  # In that case, a participation location is automatically created
  # alongside the trackable, which prevents the factory from creating
  # a second one.
  factory :participation_location do
    association :trackable, factory: :idea
  end
end
