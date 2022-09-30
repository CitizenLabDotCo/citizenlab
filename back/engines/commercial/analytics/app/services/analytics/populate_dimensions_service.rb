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
        dates_count = Analytics::DimensionDate.count
        from = Time.zone.today
        to = Time.zone.today + 6.months

        if dates_count == 0
          first_idea = Idea.order(:created_at).limit(1).pluck(:created_at)
          first_initiative = Initiative.order(:created_at).limit(1).pluck(:created_at)
          first_post = [first_idea, first_initiative].min[0]
          unless first_post.nil?
            from = first_post.to_datetime
          end
        else
          last_date = Analytics::DimensionDate.order(date: :desc).limit(1).pluck(:date)
          from = last_date[0].to_datetime + 1.day
        end

        (from..to).each do |date|
          new_date = Analytics::DimensionDate.new
          new_date.date = date
          new_date.week = date.beginning_of_week.to_date
          new_date.month = "#{date.year}-#{date.strftime('%m')}"
          new_date.year = date.year
          new_date.save
        end
      end

      def populate_types
        post_types = 'idea%post|initiative%post|comment%nil|vote%nil'
        types = post_types.split('|').map { |type| type.split '%' }
        types.each do |name, parent|
          next if Analytics::DimensionType.exists?(name: name)

          new_type = Analytics::DimensionType.new
          new_type.name = name
          new_type.parent = parent == 'nil' ? nil : parent
          new_type.save
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
        referrer_types = 'website%Websites|social%Social Networks|search%Search Engines|campaigns%Campaigns|direct%Direct Entry'
        types = referrer_types.split('|').map { |type| type.split '%' }
        types.each do |key, name|
          next if Analytics::DimensionReferrerType.exists?(key: key)

          Analytics::DimensionReferrerType.create!(key: key, name: name)
        end
      end
  end
  end
end
