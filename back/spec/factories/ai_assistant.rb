# frozen_string_literal: true

FactoryBot.define do
  factory :ai_assistant_conversation, class: 'AIAssistant::Conversation' do
    user factory: :super_admin
    add_attribute(:context) { association :native_survey_phase, project: association(:project, :draft) }
    context_key { 'survey_builder' }
    locale { 'en' }
  end

  factory :ai_assistant_message, class: 'AIAssistant::Message' do
    conversation factory: :ai_assistant_conversation
    role { 'user' }
    content { 'Create a survey about our park.' }
  end
end
