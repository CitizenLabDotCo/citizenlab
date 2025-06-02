# frozen_string_literal: true

FactoryBot.define do
  factory :pageview, class: 'ImpactTracking::Pageview' do
    session
    path { '/en/' }
    project_id { nil }
  end
end
