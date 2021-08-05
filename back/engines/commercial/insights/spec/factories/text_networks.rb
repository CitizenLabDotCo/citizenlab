# frozen_string_literal: true

FactoryBot.define do
  factory :insights_text_network, class: 'Insights::TextNetwork' do
    language { 'en' }
    network { build(:nlp_text_network).as_json }
    view
  end
end
