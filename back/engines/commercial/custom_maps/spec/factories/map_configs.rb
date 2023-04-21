# frozen_string_literal: true

FactoryBot.define do
  sequence :tile_provider do |n|
    "https://some.map.service/maps/basic/{z}/{x}/{y}/#{n}.png?key=abcdefg"
  end

  factory :map_config, class: 'CustomMaps::MapConfig' do
    project

    trait :with_positioning do
      center { RGeo::Cartesian.factory.point(Faker::Address.longitude, Faker::Address.latitude) }
      zoom_level { rand(1..20) }
    end

    trait :with_tile_provider do
      tile_provider { generate(:tile_provider) }
    end

    trait :with_layers do
      after(:create) do |map_config, _evaluator|
        create(:layer, :with_marker_svg, map_config: map_config)
      end
    end

    trait :with_legend do
      after(:create) do |map_config, _evaluator|
        create_list(:legend_item, 2, map_config: map_config)
      end
    end
  end
end
