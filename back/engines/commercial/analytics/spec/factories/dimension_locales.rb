# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_locale, class: 'Analytics::DimensionLocale' do
    sequence(:name) { |n| "en-#{n}" }
  end
end
