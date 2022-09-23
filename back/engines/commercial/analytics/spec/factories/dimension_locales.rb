# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_locale_en, class: 'Analytics::DimensionLocale' do
    name { 'en' }
  end
  factory :dimension_locale_nl, class: 'Analytics::DimensionLocale' do
    name { 'nl' }
  end
end

