# frozen_string_literal: true

FactoryBot.define do
  factory :custom_form_logic do
    association :source_field, factory: :custom_field
    association :target_field, factory: :custom_field
    condition_value_select { nil }
    condition_value_number { 1 }
    condition_operator { 'EQUALITY' }
    action { 'HIDE' }
  end
end
