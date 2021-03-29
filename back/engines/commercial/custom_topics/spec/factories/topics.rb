# frozen_string_literal: true

FactoryBot.define do
  factory :custom_topic, parent: :topic do
    code { 'custom' }
  end
end
