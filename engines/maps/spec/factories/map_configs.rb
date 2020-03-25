FactoryBot.define do
  factory :map_config, class: 'Maps::MapConfig' do
    project

    trait :with_positioning do 
      center { RGeo::Cartesian.factory.point(4.3517, 50.8503) }
      zoom_level { 14.25 }
    end

    trait :with_tile_provider do 
      tile_provider { "https://some.map.service/maps/basic/{z}/{x}/{y}.png?key=abcdefg" }
    end

    trait :with_layers do
      after(:create) do |map_config, evaluator|
        map_config.layers = [create(:layer, map_config: map_config)]
      end
    end

    trait :with_legend do
      after(:create) do |map_config, evaluator|
        map_config.legend_items = [
          create(:legend_item, map_config: map_config),
          create(:legend_item, map_config: map_config),
        ]
      end
    end
  end
end
