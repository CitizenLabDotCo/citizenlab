# frozen_string_literal: true

FactoryBot.define do
  factory :permissions_field do
    required { true }
    enabled { true }
    verified { false }
    field_type { 'custom_field' }
    permission
    custom_field
  end
end
