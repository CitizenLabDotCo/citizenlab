FactoryBot.define do
  factory :layer, class: 'CustomMaps::Layer' do
    map_config
    title_multiloc do
      {
        'en' => 'Social equity regions'
      }
    end
    geojson { JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'seattle.geojson'))) }

    trait :with_marker_svg do
      marker_svg_url { 'https://some.domain.com/marker.svg' }
    end
  end
end
