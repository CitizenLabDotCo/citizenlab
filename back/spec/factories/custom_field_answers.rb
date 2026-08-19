# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field_answer do
    answerable factory: :user
    key { 'field_key' }
    value { 'answer' }
  end
end
