# frozen_string_literal: true

FactoryBot.define do
  factory :tag, class: 'Analysis::Tag' do
    analysis
    tag_type { 'custom' }
    sequence(:name) { |n| "category_#{n}" }
  end
end
