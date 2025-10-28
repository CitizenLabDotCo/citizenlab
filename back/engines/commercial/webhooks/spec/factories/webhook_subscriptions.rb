# frozen_string_literal: true

FactoryBot.define do
  factory :webhook_subscription, class: 'Webhooks::Subscription' do
    name { 'Test Webhook' }
    url { 'https://webhook.example.com/receive' }
    events { ['idea.created', 'idea.published'] }
    enabled { true }
    secret_token { SecureRandom.base64(32) }
    project { nil }

    trait :disabled do
      enabled { false }
    end

    trait :with_project do
      association :project
    end

    trait :idea_events do
      events { ['idea.created', 'idea.published', 'idea.changed'] }
    end

    trait :user_events do
      events { ['user.created'] }
    end
  end
end
