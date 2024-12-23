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

      def populate_types
        types = [
          { name: 'idea', parent: 'post' },
          { name: 'proposal', parent: 'post' },
          { name: 'comment', parent: 'idea' },
          { name: 'comment', parent: 'proposal' },
          { name: 'reaction', parent: 'idea' },
          { name: 'reaction', parent: 'comment' },
          { name: 'poll', parent: nil },
          { name: 'volunteer', parent: nil },
          { name: 'survey', parent: nil },
          { name: 'basket', parent: nil },
          { name: 'event_attendance', parent: nil },
          *Follower::FOLLOWABLE_TYPES.map { |type| { name: 'follower', parent: type.downcase } }
        ]

        current_types = Analytics::DimensionType.all.as_json(only: %i[name parent])
        return if current_types.to_set == types.as_json.to_set

        Analytics::DimensionType.insert_all(types)
      end

      private

      def populate_dates
        from = Time.zone.today
        to = from + 180.days

        tenant_creation = AppConfiguration.instance.created_at
        first_idea = Idea.order(:created_at).limit(1).pluck(:created_at)[0]
        first_activity_date = [tenant_creation, first_idea].compact.min.to_date

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
        insert_dates = (from..to).map do |date|
          {
            date: date,
            week: date.beginning_of_week.to_date,
            month: "#{date.year}-#{date.strftime('%m')}",
            year: date.year
          }
        end
        if insert_dates.present?
          insert_dates.each_slice(200) do |dates|
            Analytics::DimensionDate.insert_all(dates)
          end
        end
      end

      def populate_locales
        locales = AppConfiguration.instance.settings('core', 'locales').map do |locale_name|
          { name: locale_name }
        end

        current_locales = Analytics::DimensionLocale.all.as_json(only: %i[name])
        return if current_locales.to_set == locales.as_json.to_set

        Analytics::DimensionLocale.insert_all(locales)
      end

      def populate_referrer_types
        types = [
          { key: 'website', name: 'Websites' },
          { key: 'social', name: 'Social Networks' },
          { key: 'search', name: 'Search Engines' },
          { key: 'campaigns', name: 'Campaigns' },
          { key: 'direct', name: 'Direct Entry' }
        ]

        current_types = Analytics::DimensionReferrerType.all.as_json(only: %i[key name])
        return if current_types.to_set == types.as_json.to_set

        Analytics::DimensionReferrerType.insert_all(types)
      end
    end
  end
end
