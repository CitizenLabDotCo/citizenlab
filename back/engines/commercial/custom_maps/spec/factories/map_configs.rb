# frozen_string_literal: true

FactoryBot.define do
  sequence :tile_provider do |n|
    "https://some.map.service/maps/basic/{z}/{x}/{y}/#{n}.png?key=abcdefg"
  end

  factory :map_config, class: 'CustomMaps::MapConfig' do
    transient do
      project { create(:project) }
    end
    mappable { project }

    trait :with_positioning do
      center { RGeo::Cartesian.factory.point(Faker::Address.longitude, Faker::Address.latitude) }
      zoom_level { rand(1..20) }
    end

    trait :with_tile_provider do
      tile_provider { generate(:tile_provider) }
    end

    trait :with_geojson_layers do
      after(:create) do |map_config, _evaluator|
        create(:geojson_layer, :with_marker_svg, map_config: map_config)
      end
    end

    trait :with_esri_feature_layers do
      after(:create) do |map_config, _evaluator|
        create(:esri_feature_layer, :with_marker_svg, map_config: map_config)
      end
    end

    trait :with_esri_web_map_id do
      esri_web_map_id { SecureRandom.uuid }
    end

    trait :with_esri_base_map_id do
      esri_base_map_id { SecureRandom.uuid }
    end
  end
end
