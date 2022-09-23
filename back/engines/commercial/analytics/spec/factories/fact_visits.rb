# frozen_string_literal: true

FactoryBot.define do

  factory :fact_visit, class: 'Analytics::FactVisit' do

    association :dimension_channel, factory: :dimension_channel_website
    association :dimension_date_first_action, factory: :dimension_date_first
    association :dimension_date_last_action, factory: :dimension_date_last
    visitor_id { 'XXX1' } #  string           not null
    dimension_user_id { 'XXX1' } # uuid
    duration { 500 } # integer          not null
    pages_visited { 5 } # integer          not null
    returning_visitor { true } # boolean          default(TRUE), not null
    matomo_visit_id { 1 } # integer          not null
    matomo_last_action_time { '2022-09-01 12:00:00' }      # datetime         not null

  end

  factory :fact_visit_no_user, class: 'Analytics::FactVisit' do

    association :dimension_channel, factory: :dimension_channel_website
    association :dimension_date_first_action, factory: :dimension_date_first
    association :dimension_date_last_action, factory: :dimension_date_last
    visitor_id { 'XXX1' } #  string           not null
    duration { 500 } # integer          not null
    pages_visited { 5 } # integer          not null
    returning_visitor { true } # boolean          default(TRUE), not null
    matomo_visit_id { 2 } # integer          not null
    matomo_last_action_time { '2022-09-02 12:00:00' }      # datetime         not null

  end

end
