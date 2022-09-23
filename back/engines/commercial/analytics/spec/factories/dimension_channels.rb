# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_channel_website, class: 'Analytics::DimensionChannel' do
    name_multiloc { { en: 'Website', 'fr-BE': 'Website', 'nl-BE': 'Website' } }
  end
end
