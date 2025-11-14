# frozen_string_literal: true

FactoryBot.define do
  factory :webhook_delivery, class: 'Webhooks::Delivery' do
    association :subscription, factory: :webhook_subscription
    association :activity, factory: :idea_created_activity
    event_type { 'idea.created' }
    status { 'pending' }
    attempts { 0 }

    trait :succeeded do
      status { 'success' }
      attempts { 1 }
      response_code { 200 }
      response_body { 'OK' }
      succeeded_at { Time.current }
      last_attempt_at { Time.current }
    end

    trait :failed do
      status { 'failed' }
      attempts { 3 }
      response_code { 500 }
      error_message { 'Internal Server Error' }
      last_attempt_at { Time.current }
    end

    trait :old do
      created_at { 45.days.ago }
    end
  end
end
