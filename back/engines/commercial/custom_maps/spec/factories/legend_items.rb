# frozen_string_literal: true

FactoryBot.define do
  factory :legend_item, class: 'CustomMaps::LegendItem' do
    map_config
    sequence(:title_multiloc) do |n|
      {
        'en' => "Legend item #{n}"
      }
    end
    color { Faker::Color.hex_color }
  end
end
