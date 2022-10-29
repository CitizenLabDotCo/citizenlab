# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_referrer_type, class: 'Analytics::DimensionReferrerType' do
    sequence(:key) { |n| "referrer-#{n}" }
    name { 'Referrer' }
  end
end
