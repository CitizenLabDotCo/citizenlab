# frozen_string_literal: true

FactoryBot.define do
  factory :view, class: 'Insights::View' do
    sequence(:name) { |n| "view_#{n}" }
    scope factory: :project
  end
end
