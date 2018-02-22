FactoryBot.define do
  factory :custom_field_option do
    custom_field
    sequence(:key) { |n| "option_#{n}" }
    is_default false
    title_multiloc {{
      "en" => "youth council"
    }}
    ordering 1
  end
end
