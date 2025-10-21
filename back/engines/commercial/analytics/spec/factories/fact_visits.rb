# frozen_string_literal: true

FactoryBot.define do
  factory :fact_visit, class: 'Analytics::FactVisit' do
    association :dimension_referrer_type
    association :dimension_date_first_action, factory: :dimension_date
    association :dimension_date_last_action, factory: :dimension_date

    sequence(:visitor_id) { |n| "v-#{n}" }
    duration { 500 }
    pages_visited { 5 }
    returning_visitor { true }
    sequence(:matomo_visit_id)
    matomo_last_action_time { dimension_date_first_action.date }
  end
end
