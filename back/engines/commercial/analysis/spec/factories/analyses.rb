# frozen_string_literal: true

FactoryBot.define do
  factory :analysis, aliases: [:ideation_analysis], class: 'Analysis::Analysis' do
    association :project, factory: :project_with_active_ideation_phase

    trait :with_custom_field do
      after(:create) do |analysis|
        cf = create(:custom_field_extra_custom_form)
        analysis.custom_fields << cf
      end
    end
  end

  factory :survey_analysis, class: 'Analysis::Analysis' do
    association :phase, factory: :native_survey_phase
  end
end
