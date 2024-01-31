# frozen_string_literal: true

module Analytics
  class PopulateDimensionsService
    class << self
      def run
        populate_types
        populate_locales
        populate_referrer_types
      end

      private

      def populate_types
        types = [
          { name: 'idea', parent: 'post' },
          { name: 'initiative', parent: 'post' },
          { name: 'comment', parent: 'initiative' },
          { name: 'comment', parent: 'idea' },
          { name: 'reaction', parent: 'initiative' },
          { name: 'reaction', parent: 'idea' },
          { name: 'reaction', parent: 'comment' },
          { name: 'poll', parent: nil },
          { name: 'volunteer', parent: nil },
          { name: 'survey', parent: nil }
        ]

        current_types = Analytics::DimensionType.all.as_json(only: %i[name parent])

        return unless current_types & types != types

        Analytics::DimensionType.delete_all
        Analytics::DimensionType.insert_all(types)
      end

      def populate_locales
        locales = AppConfiguration.instance.settings('core', 'locales')
        locales.each do |locale_name|
          next if Analytics::DimensionLocale.exists?(name: locale_name)

          Analytics::DimensionLocale.create!(name: locale_name)
        end
      end

      def populate_referrer_types
        types = [
          { key: 'website', name: 'Websites' },
          { key: 'social', name: 'Social Networks' },
          { key: 'search', name: 'Search Engines' },
          { key: 'campaigns', name: 'Campaigns' },
          { key: 'direct', name: 'Direct Entry' }
        ]
        types.each do |type|
          next if Analytics::DimensionReferrerType.exists?(key: type[:key])

          Analytics::DimensionReferrerType.create!(key: type[:key], name: type[:name])
        end
      end
    end
  end
end
