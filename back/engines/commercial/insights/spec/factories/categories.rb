# frozen_string_literal: true

FactoryBot.define do
  factory :category, class: 'Insights::Category' do
    view factory: :view

    sequence(:name) { |n| "category_#{n}" }
    sequence(:position) # It adds new categories at the bottom.
  end
end
