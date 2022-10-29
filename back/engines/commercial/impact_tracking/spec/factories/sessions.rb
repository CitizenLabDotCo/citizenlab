# frozen_string_literal: true

FactoryBot.define do
  factory :session, class: 'ImpactTracking::Session' do
    monthly_user_hash { 'aasdf12a1s3f12ds231as21hfg2h1df2g1h1' }
  end
end
