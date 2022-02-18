FactoryBot.define do
  factory :area do
    ordering { nil }
    title_multiloc {{
      "en" => "Westside",
      "nl-BE" => "Westerbuurt"
    }}
    description_multiloc {{
      "en" => "<p>A <i>calm</i> space to relax, where the city meets the woods.</p>",
      "nl-BE" => "<p>Een <i>kalme</i> buurt om te relaxen, waar de stad en het bos samensmelten.</p>",
    }}

    factory :area_with_polygon do
      geometry_geojson { Rails.root.join("spec/fixtures/polygon.geojson").read }
    end

    factory :area_with_multipolygon do
      geometry_geojson { Rails.root.join("spec/fixtures/multi-polygon.geojson").read }
    end

    factory :area_with_point do
      geometry_geojson { Rails.root.join("spec/fixtures/point.geojson").read }
    end
  end
end
