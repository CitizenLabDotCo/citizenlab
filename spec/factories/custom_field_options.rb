FactoryBot.define do
  factory :custom_field_option do
    custom_field
    sequence(:key) { |n| "option_#{n}" }
    title_multiloc {{
      "en" => "youth council"
    }}
  end
end
