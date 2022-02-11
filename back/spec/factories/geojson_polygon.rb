FactoryBot.define do
  factory :geojson_polygon do
    polygon { Rails.root.join("spec/fixtures/polygon.geojson").open }
  end
end
