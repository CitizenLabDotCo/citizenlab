# frozen_string_literal: true

FactoryBot.define do
  factory :session, class: 'ImpactTracking::Session' do
    monthly_user_hash { 'aasdf12a1s3f12ds231as21hfg2h1df2g1h1' }

    trait :with_pageview do
      transient do
        project { nil }
        pageview_created_at { Time.zone.now }
      end

      after(:create) do |session, evaluator|
        create(:pageview, session: session, project_id: evaluator.project&.id, created_at: evaluator.pageview_created_at)
      end
    end
  end
end
