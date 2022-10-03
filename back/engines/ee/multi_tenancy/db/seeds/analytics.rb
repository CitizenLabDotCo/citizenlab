# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Analytics < Base
      def run
        ::Analytics::PopulateDimensionsService.run

        project = ::Analytics::DimensionProject.first
        user = ::Analytics::DimensionUser.first
        locale1 = ::Analytics::DimensionLocale.first
        locale2 = ::Analytics::DimensionLocale.last
        referrer_type1 = ::Analytics::DimensionReferrerType.first
        referrer_type2 = ::Analytics::DimensionReferrerType.last
        date1, date2 = ::Analytics::DimensionDate.take(2)

        # Insert 2 visits (same user)
        visit1 = ::Analytics::FactVisit.create!(
          visitor_id: 'XX1',
          dimension_user: user,
          dimension_referrer_type: referrer_type1,
          dimension_date_first_action: date1,
          dimension_date_last_action: date1,
          duration: 100,
          pages_visited: 1,
          matomo_visit_id: 101,
          matomo_last_action_time: date1.date
        )
        visit1.dimension_projects << project
        visit1.dimension_locales << locale1

        visit2 = ::Analytics::FactVisit.create!(
          visitor_id: 'XX1',
          dimension_user: user,
          dimension_referrer_type: referrer_type1,
          dimension_date_first_action: date1,
          dimension_date_last_action: date1,
          duration: 200,
          pages_visited: 2,
          matomo_visit_id: 102,
          matomo_last_action_time: date1.date
        )
        visit2.dimension_projects << project
        visit2.dimension_locales << locale2

        # Visit 3 - No user, no project
        visit3 = ::Analytics::FactVisit.create!(
          visitor_id: 'XX3',
          dimension_referrer_type: referrer_type2,
          dimension_date_first_action: date2,
          dimension_date_last_action: date2,
          duration: 300,
          pages_visited: 3,
          returning_visitor: false,
          matomo_visit_id: 103,
          matomo_last_action_time: date2.date
        )
        visit3.dimension_locales << locale2
      end
    end
  end
end
