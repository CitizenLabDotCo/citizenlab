# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Custom field answers' do
  explanation <<~DESC.squish
    Answers to custom fields, one per question per user (registration questions) or per
    input (form and survey questions). Questions and their options are listed in the custom
    fields and custom field options endpoints.
  DESC

  include_context 'common_auth'

  let_it_be(:project) { create(:project) }
  let_it_be(:idea) { create(:idea, project: project) }
  let_it_be(:other_idea) { create(:idea) }
  let_it_be(:user) { create(:user) }

  let_it_be(:select_field) { create(:custom_field_select, :with_options) }
  let_it_be(:ranking_field) { create(:custom_field_ranking, :with_options, :for_custom_form) }
  let_it_be(:text_field) { create(:custom_field, :for_custom_form) }

  let_it_be(:user_answer) { create(:custom_field_answer, answerable: user, custom_field: select_field, key: select_field.key, value: 'option2') }
  let_it_be(:ranking_answer) do
    create(:custom_field_answer, answerable: idea, custom_field: ranking_field, key: ranking_field.key, value: %w[by_bike by_train])
  end
  let_it_be(:text_answer) { create(:custom_field_answer, answerable: other_idea, custom_field: text_field, key: text_field.key, value: 'free text') }
  # Registration question asked in the input form.
  let_it_be(:prefixed_answer) { create(:custom_field_answer, answerable: idea, custom_field: select_field, key: "u_#{select_field.key}", value: 'option1') }
  # Companion of the select field, holding free text.
  let_it_be(:other_answer) { create(:custom_field_answer, answerable: user, custom_field: select_field, key: "#{select_field.key}_other", value: 'option1') }

  get '/api/v2/custom_field_answers' do
    route_summary 'List custom field answers'
    route_description <<~DESC.squish
      Retrieve a paginated list of the answers to custom fields, with the most recently created
      ones first. The value is returned as stored: text, a number, a list of option keys, or an
      object for matrix and file questions. For questions with options, custom_field_option_ids
      holds the chosen options, in the order of the answer (the rank, for ranking questions).
    DESC

    include_context 'common_list_params'

    parameter(:answerable_type, 'List only the answers of users or of inputs.', required: false, in: 'query', type: 'string', enum: PublicApi::V2::CustomFieldAnswersController::ANSWERABLE_TYPES)
    parameter(:answerable_id, 'List only the answers of one user or input.', required: false, in: 'query', type: 'string')
    parameter(:custom_field_id, 'List only the answers to a custom field.', required: false, in: 'query', type: 'string')
    parameter(:project_id, 'List only the answers of the inputs of a project.', required: false, in: 'query', type: 'string')

    example_request 'List all custom field answers' do
      assert_status 200
      answers = json_response_body[:custom_field_answers].index_by { it[:id] }

      expect(answers.keys).to match_array CustomFieldAnswer.ids
      expect(answers[user_answer.id].keys).to match_array %i[
        id answerable_type answerable_id custom_field_id key value custom_field_option_ids created_at updated_at
      ]

      expect(answers[user_answer.id]).to include(
        answerable_type: 'user', answerable_id: user.id, custom_field_id: select_field.id,
        value: 'option2', custom_field_option_ids: [select_field.options.find_by(key: 'option2').id]
      )
      expect(answers[ranking_answer.id]).to include(
        answerable_type: 'idea', value: %w[by_bike by_train],
        custom_field_option_ids: %w[by_bike by_train].map { ranking_field.options.find_by(key: it).id }
      )
      expect(answers[text_answer.id]).to include(value: 'free text', custom_field_option_ids: [])
      expect(answers[prefixed_answer.id][:custom_field_option_ids]).to eq [select_field.options.find_by(key: 'option1').id]
      expect(answers[other_answer.id][:custom_field_option_ids]).to eq []
    end

    context 'when filtering by answerable type' do
      let(:answerable_type) { 'user' }

      example_request 'List only the answers of users', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_answers].pluck(:id)).to contain_exactly(user_answer.id, other_answer.id)
      end
    end

    context 'when the answerable type is invalid' do
      let(:answerable_type) { 'comment' }

      example_request 'Returns a bad request error', document: false do
        assert_status 400
        expect(json_response_body[:parameter_name]).to eq 'answerable_type'
      end
    end

    context 'when filtering by answerable' do
      let(:answerable_id) { other_idea.id }

      example_request 'List only the answers of the input', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_answers].pluck(:id)).to eq [text_answer.id]
      end
    end

    context 'when filtering by custom field' do
      let(:custom_field_id) { ranking_field.id }

      example_request 'List only the answers to the custom field', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_answers].pluck(:id)).to eq [ranking_answer.id]
      end
    end

    context 'when filtering by project' do
      let(:project_id) { project.id }

      example_request 'List only the answers of the inputs of the project', document: false do
        assert_status 200
        expect(json_response_body[:custom_field_answers].pluck(:id)).to contain_exactly(ranking_answer.id, prefixed_answer.id)
      end
    end
  end
end
