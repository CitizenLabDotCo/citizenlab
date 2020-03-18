FactoryBot.define do
  factory :layer, class: 'Maps::Layer' do
    map_config
    title_multiloc {{
      "en" => "Social equity regions"
    }}
    geojson { JSON.parse(File.read(Maps::Engine.root.join("spec","fixtures","seattle.geojson"))) }

    trait :with_legend do
      after(:create) do |layer, evaluator|
        layer.legend_items = [
          create(:legend_item, layer: layer),
          create(:legend_item, layer: layer),
        ]
      end
    end
  end
end
