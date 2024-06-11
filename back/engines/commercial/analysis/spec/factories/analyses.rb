# frozen_string_literal: true

FactoryBot.define do
  factory :analysis, aliases: [:ideation_analysis], class: 'Analysis::Analysis' do
    association :project, factory: :project_with_active_ideation_phase
    association :main_custom_field, factory: %i[custom_field for_custom_form]
  end

  factory :survey_analysis, class: 'Analysis::Analysis' do
    association :phase, factory: :native_survey_phase
    association :main_custom_field, factory: %i[custom_field for_custom_form]
  end
end
