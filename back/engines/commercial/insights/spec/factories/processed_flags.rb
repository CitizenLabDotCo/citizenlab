# frozen_string_literal: true

FactoryBot.define do
  factory :processed_flag, class: 'Insights::ProcessedFlag' do
    view factory: :view
    input factory: :idea
  end
end
