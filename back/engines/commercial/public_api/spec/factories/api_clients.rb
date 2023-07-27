# frozen_string_literal: true

FactoryBot.define do
  factory :api_client, class: 'PublicApi::ApiClient' do
    sequence(:name) { |n| "Api Client #{n}" }
  end
end
