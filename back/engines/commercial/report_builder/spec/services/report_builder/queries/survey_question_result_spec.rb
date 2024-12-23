# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::SurveyQuestionResult do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    # setup copied from back/spec/services/survey_results_generator_service_spec.rb
    let_it_be(:project) { create(:single_phase_native_survey_project) }
    let_it_be(:survey_phase) { project.phases.first }
    let_it_be(:phases_of_inputs) { [survey_phase] }
    let_it_be(:form) { create(:custom_form, participation_context: survey_phase) }
    let_it_be(:select_field) do
      create(
        :custom_field_select,
        resource: form,
        title_multiloc: { 'en' => 'What city do you like best?' },
        description_multiloc: {},
        required: true,
        options: [
          create(:custom_field_option, key: 'la', title_multiloc: { 'en' => 'Los Angeles' }),
          create(:custom_field_option, key: 'ny', title_multiloc: { 'en' => 'New York' })
        ]
      )
    end

    before_all do
      create(:idea_status_proposed)
      create(
        :native_survey_response,
        project: project,
        phases: phases_of_inputs,
        custom_field_values: { select_field.key => 'la' }
      )
    end

    context 'when phase_id is provided' do
      it 'returns serialized data' do
        result = query.run_query(phase_id: survey_phase.id, question_id: select_field.id)

        expect(result).to include(
          answers: [
            { answer: 'la', count: 1 },
            { answer: 'ny', count: 0 },
            { answer: nil, count: 0 }
          ],
          customFieldId: select_field.id,
          grouped: false,
          inputType: 'select',
          questionResponseCount: 1,
          required: true,
          totalPickCount: 1,
          totalResponseCount: 1
        )
      end
    end

    context 'when phase_id is not provided' do
      it 'returns an empty hash' do
        expect(query.run_query).to eq({})
      end
    end
  end
end
