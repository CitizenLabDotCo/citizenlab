# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_referrer_type_website, class: 'Analytics::DimensionReferrerType' do
    key { 'website' }
    name { 'Website' }
  end
end
