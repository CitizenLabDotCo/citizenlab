# frozen_string_literal: true

FactoryBot.define do
  factory :fact_visit, class: 'Analytics::FactVisit' do
    transient do
      date_dimension { Analytics::DimensionDate.first || create(:dimension_date) }
      referrer_type_dimension { Analytics::DimensionReferrerType.first || create(:dimension_referrer_type_website) }
    end
    dimension_referrer_type { referrer_type_dimension }
    dimension_date_first_action { date_dimension }
    dimension_date_last_action { date_dimension }
    sequence(:visitor_id) { |n| "v-#{n}" }
    duration { 500 }
    pages_visited { 5 }
    returning_visitor { true }
    sequence(:matomo_visit_id)
    matomo_last_action_time { date_dimension.date }
  end
end
