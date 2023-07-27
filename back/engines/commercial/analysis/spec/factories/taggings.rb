# frozen_string_literal: true

FactoryBot.define do
  factory :tagging, class: 'Analysis::Tagging' do
    tag
    association :input, factory: :idea
  end
end
