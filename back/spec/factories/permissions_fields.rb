# frozen_string_literal: true

FactoryBot.define do
  factory :permissions_field do
    required { true }
    permission
    custom_field
  end
end
