# frozen_string_literal: true

FactoryBot.define do
  factory :category_assignment, class: 'Insights::CategoryAssignment' do
    view factory: :view
    category factory: :category
    input factory: :idea
  end
end
