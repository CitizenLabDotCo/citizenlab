FactoryBot.define do
  factory :layer, class: 'Maps::Layer' do
    map_config
    title_multiloc {{
      "en" => "Social equity regions"
    }}
    geojson { JSON.parse(File.read(Maps::Engine.root.join("spec","fixtures","seattle.geojson"))) }
  end
end
