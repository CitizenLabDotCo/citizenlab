# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field_answer do
    answerable { association(:user) }
    custom_field { association(:custom_field) }
    key { custom_field&.key || 'field_key' }
    value { 'an answer' }
  end
end
