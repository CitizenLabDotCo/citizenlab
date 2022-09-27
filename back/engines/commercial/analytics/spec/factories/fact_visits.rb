# frozen_string_literal: true

FactoryBot.define do
  factory :fact_visit, class: 'Analytics::FactVisit' do
    transient do
      date_dimension { Analytics::DimensionDate.first || create(:dimension_date_sept) }
      referrer_type_dimension { Analytics::DimensionReferrerType.first || create(:dimension_referrer_type_website) }
    end
    dimension_referrer_type { referrer_type_dimension }
    dimension_date_first_action { date_dimension }
    dimension_date_last_action { date_dimension }
    visitor_id { 'XXX1' } #  string           not null
    duration { 500 } # integer          not null
    pages_visited { 5 } # integer          not null
    returning_visitor { true } # boolean          default(TRUE), not null
    matomo_visit_id { 1 } # integer          not null
    matomo_last_action_time { '2022-09-01 12:00:00' } # datetime         not null
  end
end
