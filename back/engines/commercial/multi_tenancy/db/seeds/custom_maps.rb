# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CustomMaps < Base
      def run
        map_config = ::CustomMaps::MapConfig.create!(
          project: Project.find_by!(internal_role: 'open_idea_box'),
          center: RGeo::Cartesian.factory.point(4.3517103, 50.8503396),
          zoom_level: 14
        )

        ::CustomMaps::Layer.create!(
          map_config: map_config,
          type: 'CustomMaps::GeojsonLayer',
          title_multiloc: { en: 'Districts', 'nl-BE': 'Districten' },
          geojson: JSON.parse(File.read(::CustomMaps::Engine.root.join('spec', 'fixtures', 'brussels-districts.geojson'))),
          default_enabled: true
        )

        ::CustomMaps::Layer.create!(
          map_config: map_config,
          type: 'CustomMaps::GeojsonLayer',
          title_multiloc: { en: 'Public toilets', 'nl-BE': 'Publieke toiletten' },
          geojson: JSON.parse(File.read(::CustomMaps::Engine.root.join('spec', 'fixtures',
            'bruxelles_toilettes_publiques.geojson'))),
          default_enabled: false
        )
      end
    end
  end
end
