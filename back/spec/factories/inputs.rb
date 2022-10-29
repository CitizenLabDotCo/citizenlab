# frozen_string_literal: true

FactoryBot.define do
  factory :input, class: 'Idea' do
    publication_status { 'published' }
    association :project, factory: :continuous_native_survey_project
    author
    idea_status
  end
end
