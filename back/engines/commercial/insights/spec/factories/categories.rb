# frozen_string_literal: true

FactoryBot.define do
  factory :category, class: 'Insights::Category' do
    view factory: :view

    sequence(:name) { |n| "category_#{n}" }
    sequence(:position) # Note that it makes the assumption that new categories are added at the bottom.
  end
end
