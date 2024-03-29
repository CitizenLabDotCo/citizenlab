# frozen_string_literal: true

FactoryBot.define do
  factory :layer, class: 'CustomMaps::Layer' do
    type { 'CustomMaps::GeojsonLayer' }
    map_config
    title_multiloc do
      {
        'en' => 'Social equity regions'
      }
    end

    # Because we need to choose a whitelisted type, and we choose 'CustomMaps::GeojsonLayer',
    # we also need to satisfy the GeojsonLayer validation of presence of a valid geojson object.
    geojson { JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'seattle.geojson'))) }

    trait :with_marker_svg do
      marker_svg_url { 'https://some.domain.com/marker.svg' }
    end
  end

  factory :geojson_layer, parent: :layer, class: 'CustomMaps::GeojsonLayer' do
    type { 'CustomMaps::GeojsonLayer' }
    geojson { JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'seattle.geojson'))) }
  end

  factory :esri_feature_layer, parent: :layer, class: 'CustomMaps::EsriFeatureLayer' do
    type { 'CustomMaps::EsriFeatureLayer' }
    layer_url { 'https://some.domain.com/some_layer' }
  end
end
