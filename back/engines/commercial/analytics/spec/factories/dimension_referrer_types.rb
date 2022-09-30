# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_referrer_type, class: 'Analytics::DimensionReferrerType' do
    key { 'website' }
    name { 'Websites' }
  end
end
