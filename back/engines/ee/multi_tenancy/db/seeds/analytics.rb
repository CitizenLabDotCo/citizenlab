# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Analytics < Base
      def run
        project = Analytics::DimensionProject.first
        user = Analytics::DimensionUser.first
        locale1 = Analytics::DimensionLocale.first
        locale2 = Analytics::DimensionLocale.last
        referrer_type1 = Analytics::DimensionReferrerType.first
        referrer_type2 = Analytics::DimensionReferrerType.last
        date1 = Analytics::DimensionDate.first
        date2 = Analytics::DimensionDate.limit(2)[1]

        # Insert 2 visits (same user)
        visit = Analytics::FactVisit.create!(
          visitor_id: 'XX1',
          dimension_user: user,
          dimension_referrer_type: referrer_type1,
          dimension_date_first_action: date1,
          dimension_date_last_action: date1,
          duration: 100,
          pages_visited: 1,
          matomo_visit_id: 101,
          matomo_last_action_time: '2022-09-05 18:08:39.0'
        )
        visit.dimension_projects << project
        visit.dimension_locales << locale1

        # Visit 2
        visit = Analytics::FactVisit.create!(
          visitor_id: 'XX1',
          dimension_user: user,
          dimension_referrer_type: referrer_type1,
          dimension_date_first_action: date1,
          dimension_date_last_action: date1,
          duration: 200,
          pages_visited: 2,
          matomo_visit_id: 102,
          matomo_last_action_time: '2022-09-05 18:08:39.0'
        )
        visit.dimension_projects << project
        visit.dimension_locales << locale2

        # Visit 3 - no user, no project
        visit = Analytics::FactVisit.create!(
          visitor_id: 'XX2',
          dimension_referrer_type: referrer_type2,
          dimension_date_first_action: date2,
          dimension_date_last_action: date2,
          duration: 300,
          pages_visited: 3,
          returning_visitor: false,
          matomo_visit_id: 103,
          matomo_last_action_time: '2022-09-05 18:08:39.0'
        )
        visit.dimension_locales << locale2
      end
    end
  end
end
