# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputQuestionAnswer do
  describe 'survey answers (form on the creation phase)' do
    let(:project) { create(:single_phase_native_survey_project) }
    let(:form) { create(:custom_form, participation_context: project.phases.first) }
    let!(:select_question) { create(:custom_field_select, :with_options, resource: form) }
    let!(:scale_question) { create(:custom_field_linear_scale, resource: form) }
    let!(:multiselect_question) { create(:custom_field_multiselect, :with_options, resource: form) }

    let(:response) do
      create(:idea_status_proposed)
      create(:native_survey_response, project: project).tap do |response|
        response.update_column(:custom_field_values, {
          select_question.key => 'option1',
          scale_question.key => 4,
          multiselect_question.key => %w[option1 option2]
        })
      end
    end

    it 'explodes the answers with the right value column per question type' do
      rows = described_class.where(input_id: response.id)

      select_row = rows.find_by!(question_id: select_question.id)
      expect(select_row.value_text).to eq 'option1'
      expect(select_row.value_numeric).to be_nil
      expect(select_row.question_label).to eq 'Member of councils?'

      scale_row = rows.find_by!(question_id: scale_question.id)
      expect(scale_row.value_text).to be_nil
      expect(scale_row.value_numeric).to eq 4

      expect(rows.where(question_id: multiselect_question.id).pluck(:value_text))
        .to match_array %w[option1 option2]
    end

    it 'has no rows for skipped questions' do
      create(:idea_status_proposed)
      empty_response = create(:native_survey_response, project: project)
      empty_response.update_column(:custom_field_values, {})

      expect(described_class.where(input_id: empty_response.id)).to be_empty
    end
  end

  describe 'idea form answers (form on the project)' do
    it 'exposes extra idea-form answers' do
      project = create(:single_phase_ideation_project)
      form = create(:custom_form, participation_context: project)
      question = create(:custom_field, resource: form, input_type: 'text')
      idea = create(:idea, project: project)
      idea.update_column(:custom_field_values, { question.key => 'By bicycle' })
      row = described_class.find_by!(input_id: idea.id)

      expect(row.question_id).to eq question.id
      expect(row.value_text).to eq 'By bicycle'
    end
  end

  it 'excludes structurally complex question types' do
    project = create(:single_phase_native_survey_project)
    form = create(:custom_form, participation_context: project.phases.first)
    ranking = create(:custom_field_ranking, :with_options, resource: form)
    create(:idea_status_proposed)
    response = create(:native_survey_response, project: project)
    response.update_column(:custom_field_values, { ranking.key => %w[option1 option2] })

    expect(described_class.where(input_id: response.id)).to be_empty
  end
end
