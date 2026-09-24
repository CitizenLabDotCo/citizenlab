# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field_answer do
    answerable { association(:user) }
    key { 'field_key' }
    custom_field { CustomField.find_by(key: key) }
    value { 'an answer' }
  end
end
