# frozen_string_literal: true

FactoryBot.define do
  factory :merge_account_confirmation do
    user
    code { '123456' }
    code_sent_at { Time.zone.now }
  end
end
