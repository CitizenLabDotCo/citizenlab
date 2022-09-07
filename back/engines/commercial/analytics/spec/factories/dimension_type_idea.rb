# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_type_idea, class: 'Analytics::DimensionType' do
    name { 'idea' }
    parent { 'post' }
  end
end
