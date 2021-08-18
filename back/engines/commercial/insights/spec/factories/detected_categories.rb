# frozen_string_literal: true

FactoryBot.define do
  factory :detected_category, class: 'Insights::DetectedCategory' do
    view factory: :view

    sequence(:name) { |n| "detected_category_#{n}" }
  end
end
