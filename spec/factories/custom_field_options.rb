FactoryBot.define do
  factory :custom_field_option do
    custom_field
    key { "option_#{SecureRandom.hex(4)}" }
    is_default false
    title_multiloc {{
      "en" => "youth council"
    }}
    ordering 1
  end
end
