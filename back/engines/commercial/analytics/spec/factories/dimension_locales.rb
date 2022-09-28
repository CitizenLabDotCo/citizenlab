# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_locale, class: 'Analytics::DimensionLocale' do
    name { 'en' }
  end
end
