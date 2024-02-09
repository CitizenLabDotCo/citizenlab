# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::SurveyResponseSlicer do
  subject(:generator) { described_class.new phase }

  # Create phase and form
  let_it_be(:project) { create(:project_with_active_native_survey_phase) }
  let_it_be(:phase) { project.phases.first }
  let_it_be(:survey) { create(:custom_form, participation_context: phase) }

  # Set up form with some questions
  let_it_be(:page_field) { create(:custom_field_page, resource: survey) }

  ## Create city question
  let_it_be(:city_survey_question) do
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
      custom_field: city_survey_question,
      key: 'la',
      title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }
    )
  end
  let_it_be(:ny_option) do
    create(
      :custom_field_option,
      custom_field: city_survey_question,
      key: 'ny',
      title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }
    )
  end

  ## Create food question
  let_it_be(:food_survey_question) do
    create(
      :custom_field_select,
      resource: survey,
      title_multiloc: {
        'en' => 'What is your favorite food?',
        'fr-FR' => 'What is your favorite food?',
        'nl-NL' => 'What is your favorite food?'
      },
      description_multiloc: {},
      required: true
    )
  end
  let_it_be(:pizza_option) do
    create(
      :custom_field_option,
      custom_field: food_survey_question,
      key: 'pizza',
      title_multiloc: { 'en' => 'Pizza', 'fr-FR' => 'Pizza', 'nl-NL' => 'Pizza' }
    )
  end
  let_it_be(:burger_option) do
    create(
      :custom_field_option,
      custom_field: food_survey_question,
      key: 'burger',
      title_multiloc: { 'en' => 'Burger', 'fr-FR' => 'Burger', 'nl-NL' => 'Burger' }
    )
  end

  ## Create multiselect question
  let_it_be(:multiselect_question) do
    create(
      :custom_field_multiselect,
      :with_options,
      resource: survey,
      title_multiloc: {
        'en' => 'Multiselect',
        'fr-FR' => 'Multiselect',
        'nl-NL' => 'Multiselect'
      }
    )
  end

  # Create select user custom field
  let_it_be(:user_custom_field) { create(:custom_field_gender, :with_options) }

  # Create multiselect user custom field
  let_it_be(:user_multiselect_field) do
    create(
      :custom_field_multiselect,
      title_multiloc: {
        'en' => 'Multiselect user',
        'fr-FR' => 'Multiselect user',
        'nl-NL' => 'Multiselect user'
      },
      key: 'multiselect_user'
    )
  end
  let_it_be(:one_option) do
    create(
      :custom_field_option,
      custom_field: user_multiselect_field,
      key: 'one_option',
      title_multiloc: { 'en' => 'One option', 'fr-FR' => 'One option', 'nl-NL' => 'One option' }
    )
  end
  let_it_be(:another_option) do
    create( 
      :custom_field_option,
      custom_field: user_multiselect_field,
      key: 'another_option',
      title_multiloc: { 'en' => 'Another option', 'fr-FR' => 'Another option', 'nl-NL' => 'Another option' }
    )
  end

  # Create users
  let_it_be(:users) do
    build_list(:user, 11) do |record, index|
      record.custom_field_values = {
        gender: index.even? ? 'female' : 'male',
        user_multiselect_field.key => index < 6 ? [user_multiselect_field.options.first.key] : user_multiselect_field.options.map(&:key)
      }
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
        city_survey_question.key => index < 6 ? la_option.key : ny_option.key,
        food_survey_question.key => index.even? ? pizza_option.key : burger_option.key,
        multiselect_question.key => index < 6 ? [multiselect_question.options.first.key] : multiselect_question.options.map(&:key)
      }
      record.save!
    end
  end

  context 'when slicing by user field' do
    it 'slices select by select' do
      expect(generator.slice_by_user_field(
        city_survey_question.id,
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

    it 'slices multiselect by select' do
      expect(generator.slice_by_user_field(
        multiselect_question.id,
        user_custom_field.id
      )).to eq({
        totalResponses: 16,
        answers: [
          { answer: 'option1', group_by_value: 'female', count: 6 },
          { answer: 'option1', group_by_value: 'male', count: 5 },
          { answer: 'option2', group_by_value: 'female', count: 3 },
          { answer: 'option2', group_by_value: 'male', count: 2 }
        ]
      })
    end

    it 'slices select by multiselect' do
      expect(generator.slice_by_user_field(
        food_survey_question.id,
        user_multiselect_field.id
      )).to eq({
        totalResponses: 16,
        answers: [
          { answer: 'pizza', group_by_value: 'one_option', count: 6 },
          { answer: 'burger', group_by_value: 'one_option', count: 5 },
          { answer: 'pizza', group_by_value: 'another_option', count: 3 },
          { answer: 'burger', group_by_value: 'another_option', count: 2 }
        ]
      })
    end
  end

  context 'when slicing by other survey question' do
    it 'slices select by select' do
      expect(generator.slice_by_other_question(
        city_survey_question.id,
        food_survey_question.id
      )).to eq({
        totalResponses: 11,
        answers: [
          { answer: 'la', group_by_value: 'burger', count: 3 },
          { answer: 'la', group_by_value: 'pizza', count: 3 },
          { answer: 'ny', group_by_value: 'pizza', count: 3 },
          { answer: 'ny', group_by_value: 'burger', count: 2 }
        ]
      })
    end
  end
end
