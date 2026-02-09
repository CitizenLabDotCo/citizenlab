# frozen_string_literal: true

FactoryBot.define do
  factory :inappropriate_content_flag, class: 'FlagInappropriateContent::InappropriateContentFlag' do
    flaggable { create(:comment, body_multiloc: { 'en' => 'wanker' }) }
    toxicity_label { 'insult' }
  end
end
