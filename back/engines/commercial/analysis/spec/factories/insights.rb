# frozen_string_literal: true

FactoryBot.define do
  factory :insight, class: 'Analysis::Insight' do
    association :insightable, factory: :summary
    analysis
    filters { {} }
  end
end
