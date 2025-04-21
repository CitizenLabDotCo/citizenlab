# frozen_string_literal: true

FactoryBot.define do
  factory :pageview, class: 'ImpactTracking::Pageview' do
    session_id { '8d2c9ee4-8e08-4451-9659-7191c50899c4' }
    path { '/en/' }
    project_id { nil }
  end
end
