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

    # Because layers type column has null: false constraint & default value of 'CustomMaps::GeojsonLayer',
    # we need to satisfy the GeojsonLayer validation of presence of a valid geojson object.
    # Without the null:false db constraints, we couldn't ensure the use of a type and its related validations.
    # i.e. Although the base Layer class is useful, we don't want to use it directly to create a layer.
    geojson { JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'seattle.geojson'))) }

    trait :with_marker_svg do
      marker_svg_url { 'https://some.domain.com/marker.svg' }
    end
  end

  factory :geojson_layer, parent: :layer, class: 'CustomMaps::GeojsonLayer' do
    type { 'CustomMaps::GeojsonLayer' }
    geojson { JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'seattle.geojson'))) }
  end

  factory :esri_layer, parent: :layer, class: 'CustomMaps::EsriLayer' do
    type { 'CustomMaps::EsriLayer' }
    layer_url { 'https://some.domain.com/some_layer' }
  end
end
