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
        to = from + 6.months

        if Analytics::DimensionDate.none?
          first_idea = Idea.order(:created_at).limit(1).pluck(:created_at)
          first_initiative = Initiative.order(:created_at).limit(1).pluck(:created_at)
          first_post = [first_idea, first_initiative].min[0]
          unless first_post.nil?
            from = first_post.year > 2020 ? first_post.to_date : Date.parse('2020-01-01')
          end
        else
          last_date = Analytics::DimensionDate.order(date: :desc).first.date
          from = last_date + 1.day
        end

        (from..to).each do |date|
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
          { name: 'vote', parent: nil }
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
