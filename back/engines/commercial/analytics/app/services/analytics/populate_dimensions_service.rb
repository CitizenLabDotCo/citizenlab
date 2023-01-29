# frozen_string_literal: true

module Analytics
  class PopulateDimensionsService
    class << self
      def run
        populate_dates
        populate_types
        populate_locales
        populate_referrer_types
      end

    private

      def populate_dates
        from = Time.zone.today
        to = from + 180.days

        tenant_creation = AppConfiguration.first.created_at
        first_idea = Idea.order(:created_at).limit(1).pluck(:created_at)[0]
        first_initiative = Initiative.order(:created_at).limit(1).pluck(:created_at)[0]
        first_activity_date = [tenant_creation, first_idea, first_initiative].compact.min.to_date

        if Analytics::DimensionDate.none?
          from = first_activity_date
        else
          first_dimension_date = Analytics::DimensionDate.order(date: :asc).first.date
          last_dimension_date = Analytics::DimensionDate.order(date: :desc).first.date
          from = last_dimension_date + 1.day
          if first_activity_date < first_dimension_date
            # Back fill any earlier dates that may have been missed due to previous issue with population
            create_dates(first_activity_date, first_dimension_date - 1.day)
          end
        end
        create_dates(from, to)
      end

      def create_dates(from, to)
        (from..to).each do |date|
          next if date.year < 2020 # We don't want any date dimensions earlier than 2020

          Analytics::DimensionDate.create!(
            date: date,
            week: date.beginning_of_week.to_date,
            month: "#{date.year}-#{date.strftime('%m')}",
            year: date.year
          )
        end
      end

      def populate_types
        types = [
          { name: 'idea', parent: 'post' },
          { name: 'initiative', parent: 'post' },
          { name: 'comment', parent: nil },
          { name: 'vote', parent: nil },
          { name: 'poll', parent: nil },
          { name: 'volunteer', parent: nil },
          { name: 'survey', parent: nil }
        ]
        types.each do |type|
          next if Analytics::DimensionType.exists?(name: type[:name])

          Analytics::DimensionType.create!(name: type[:name], parent: type[:parent])
        end
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
