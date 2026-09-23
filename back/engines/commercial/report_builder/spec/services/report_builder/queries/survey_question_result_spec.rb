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
        custom_field_answers: [build(:custom_field_answer, key: select_field.key, value: 'la')]
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

    context 'with exclude_admins_and_moderators' do
      let_it_be(:group_field) do
        create(
          :custom_field_select,
          resource: form,
          key: 'color',
          options: [
            create(:custom_field_option, key: 'red'),
            create(:custom_field_option, key: 'blue')
          ]
        )
      end
      let_it_be(:linear_scale_field) { create(:custom_field_linear_scale, resource: form, maximum: 5) }

      before_all do
        created_at = Time.zone.local(2025, 2, 10)
        admin_and_moderator_values = { select_field.key => 'ny', group_field.key => 'blue', linear_scale_field.key => 5 }
        {
          create(:user) => { select_field.key => 'la', group_field.key => 'red', linear_scale_field.key => 2 },
          nil => { select_field.key => 'ny', group_field.key => 'red', linear_scale_field.key => 4 },
          **create_admins_and_moderators(project: project).index_with(admin_and_moderator_values)
        }.each do |author, custom_field_values|
          create(:native_survey_response, project:, phases: phases_of_inputs, author:, created_at:, custom_field_values:)
        end
      end

      def answer_counts(result)
        result[:answers].to_h { |answer| [answer[:answer], answer[:count]] }
      end

      let(:base_params) { { phase_id: survey_phase.id } }
      let(:exclude) { { exclude_admins_and_moderators: true } }

      it 'includes responses of admins and moderators by default' do
        result = query.run_query(**base_params, question_id: select_field.id)

        expect(answer_counts(result)).to eq({ 'la' => 2, 'ny' => 6, nil => 0 })
        expect(result[:questionResponseCount]).to eq(8)
      end

      it 'excludes responses of admins and moderators, but keeps responses without an author' do
        result = query.run_query(**base_params, **exclude, question_id: select_field.id)

        expect(answer_counts(result)).to eq({ 'la' => 2, 'ny' => 1, nil => 0 })
        expect(result[:questionResponseCount]).to eq(3)
        expect(result[:totalResponseCount]).to eq(3)
      end

      it 'excludes responses of admins and moderators from averages' do
        result = query.run_query(**base_params, question_id: linear_scale_field.id)
        expect(result[:averages]).to eq({ this_period: 4.4 }) # (2 + 4 + 5 * 5) / 7

        result = query.run_query(**base_params, **exclude, question_id: linear_scale_field.id)
        expect(result[:averages]).to eq({ this_period: 3.0 })
      end

      it 'excludes responses of admins and moderators when filtering by quarter' do
        params = { **base_params, **exclude, question_id: linear_scale_field.id, year: 2025, quarter: 1 }
        result = query.run_query(**params)

        expect(result[:totalResponseCount]).to eq(2)
        expect(result[:averages]).to include(this_period: 3.0)
      end

      it 'excludes responses of admins and moderators when grouping' do
        params = { **base_params, **exclude, question_id: select_field.id, group_mode: 'survey_question', group_field_id: group_field.id }
        result = query.run_query(**params)

        expect(result[:answers]).to eq([
          { answer: 'la', count: 2, groups: [{ group: 'red', count: 1 }, { group: nil, count: 1 }] },
          { answer: 'ny', count: 1, groups: [{ group: 'red', count: 1 }] },
          { answer: nil, count: 0, groups: [] }
        ])
      end
    end

    context 'when phase_id is not provided' do
      it 'returns an empty hash' do
        expect(query.run_query).to eq({})
      end
    end
  end
end
