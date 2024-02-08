# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field_option_image do
    custom_field_option
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end
