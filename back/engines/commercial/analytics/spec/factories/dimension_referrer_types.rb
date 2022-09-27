# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_referrer_type_website, class: 'Analytics::DimensionReferrerType' do
    name_multiloc { { en: 'Website', 'fr-BE': 'Website', 'nl-BE': 'Website' } }
  end
end
