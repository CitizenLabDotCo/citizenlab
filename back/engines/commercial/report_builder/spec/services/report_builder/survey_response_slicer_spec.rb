# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::SurveyResponseSlicer do
  subject(:generator) { described_class.new phase }

  # Create phase and form
  let_it_be(:project) { create(:project_with_active_native_survey_phase) }
  let_it_be(:phase) { project.phases.first }
  let_it_be(:survey) { create(:custom_form, participation_context: phase) }

  # Set up form with one question
  let_it_be(:page_field) { create(:custom_field_page, resource: survey) }
  let_it_be(:survey_select_field) do
    create(
      :custom_field_select,
      resource: survey,
      title_multiloc: {
        'en' => 'What city do you like best?',
        'fr-FR' => 'Quelle ville préférez-vous ?',
        'nl-NL' => 'Welke stad vind jij het leukst?'
      },
      description_multiloc: {},
      required: true
    )
  end
  let_it_be(:la_option) do
    create(
      :custom_field_option,
      custom_field: survey_select_field,
      key: 'la',
      title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }
    )
  end
  let_it_be(:ny_option) do
    create(
      :custom_field_option,
      custom_field: survey_select_field,
      key: 'ny',
      title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }
    )
  end

  # Create user custom field
  let_it_be(:user_custom_field) { create(:custom_field_gender, :with_options) }

  # Create users
  let_it_be(:users) do
    build_list(:user, 11) do |record, index|
      record.gender = index.even? ? 'female' : 'male'
      record.save!
    end
  end

  # Submit response for each user
  let_it_be(:responses) do
    build_list(:idea, 11) do |record, index|
      record.author = users[index]
      record.project = project
      record.phases = [phase]
      record.custom_field_values = {
        survey_select_field.key => index < 6 ? la_option.key : ny_option.key
      }
      record.save!
    end
  end

  it 'slices the survey by gender' do
    expect(generator.slice_by_user_field(
      survey_select_field.id,
      user_custom_field.id
    )).to eq({
      totalResponses: 11,
      answers: [
        { answer: 'la', group_by_value: 'female', count: 3 },
        { answer: 'la', group_by_value: 'male', count: 3 },
        { answer: 'ny', group_by_value: 'female', count: 3 },
        { answer: 'ny', group_by_value: 'male', count: 2 }
      ]
    })
  end
end
