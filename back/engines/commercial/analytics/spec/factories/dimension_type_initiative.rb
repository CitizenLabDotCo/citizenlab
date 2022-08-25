# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_type_initiative, class: 'Analytics::DimensionType' do
    name { 'initiative' }
    parent { 'post' }
  end
end
