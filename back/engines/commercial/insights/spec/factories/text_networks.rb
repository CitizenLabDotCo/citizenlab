# frozen_string_literal: true

FactoryBot.define do
  factory :insights_text_network, class: 'Insights::TextNetwork' do
    transient do
      network { build(:nlp_text_network) }
    end

    json_network { network.as_json }
    language { 'en' }
    view
  end
end
