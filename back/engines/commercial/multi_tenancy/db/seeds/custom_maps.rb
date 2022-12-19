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
          title_multiloc: { en: 'Districts', 'nl-BE': 'Districten' },
          geojson: JSON.parse(File.read(::CustomMaps::Engine.root.join('spec', 'fixtures', 'brussels-districts.geojson'))),
          default_enabled: true
        )
        ::CustomMaps::LegendItem.create!([
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Laeken' }, color: '#3b7d6c' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Neder-Over-Heembeek' }, color: '#2816b8' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Nord' }, color: '#df2397' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Louise' }, color: '#06149e' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Haren' }, color: '#e90303' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Nord-Est' }, color: '#54b1e4' },
          { map_config: map_config, title_multiloc: { 'fr-BE': 'Pentagone' }, color: '#249e0c' }
        ])

        ::CustomMaps::Layer.create!(
          map_config: map_config,
          title_multiloc: { en: 'Public toilets', 'nl-BE': 'Publieke toiletten' },
          geojson: JSON.parse(File.read(::CustomMaps::Engine.root.join('spec', 'fixtures',
            'bruxelles_toilettes_publiques.geojson'))),
          default_enabled: false
        )
      end
    end
  end
end
