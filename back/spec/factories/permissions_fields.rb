# frozen_string_literal: true

FactoryBot.define do
  factory :permissions_field do
    required { true }
    enabled { true }
    field_type { 'custom_field' }
    config { {} }
    permission
    custom_field
  end
end
