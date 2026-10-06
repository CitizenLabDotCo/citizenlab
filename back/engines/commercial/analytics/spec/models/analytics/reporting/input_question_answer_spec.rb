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
        response.custom_field_answers.create!(key: select_question.key, value: 'option1')
        response.custom_field_answers.create!(key: scale_question.key, value: 4)
        response.custom_field_answers.create!(key: multiselect_question.key, value: %w[option1 option2])
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

    it 'labels (multi)select answers with the option title' do
      select_question.options.find_by!(key: 'option1').update!(title_multiloc: { 'en' => 'Yes' })
      multiselect_question.options.find_by!(key: 'option2').update!(title_multiloc: { 'en' => 'Cycling' })
      rows = described_class.where(input_id: response.id)

      expect(rows.find_by!(question_id: select_question.id).value_label).to eq 'Yes'
      expect(rows.find_by!(question_id: multiselect_question.id, value_text: 'option2').value_label).to eq 'Cycling'
    end

    it 'labels relabelled options with the current title, not the key' do
      option = create(:custom_field_option, custom_field: select_question, key: 'no_opinion_540', title_multiloc: { 'en' => 'No opinion' })
      option.update!(title_multiloc: { 'en' => 'Less than the proposed amount' })
      create(:idea_status_proposed)
      relabelled_response = create(:native_survey_response, project: project)
      relabelled_response.custom_field_answers.create!(key: select_question.key, value: 'no_opinion_540')
      row = described_class.find_by!(input_id: relabelled_response.id)

      expect(row.value_text).to eq 'no_opinion_540'
      expect(row.value_label).to eq 'Less than the proposed amount'
    end

    describe 'linear scale point labels' do
      where(:value, :label) do
        [
          [4, 'Agree'],
          [3, nil]
        ]
      end

      with_them do
        it 'labels the chosen point, or NULL when that point has no label' do
          scale_question.update!(linear_scale_label_3_multiloc: {})
          create(:idea_status_proposed)
          scale_response = create(:native_survey_response, project: project)
          scale_response.custom_field_answers.create!(key: scale_question.key, value: value)

          expect(described_class.find_by!(input_id: scale_response.id).value_label).to eq label
        end
      end
    end

    it 'has no question_category outside the community monitor' do
      expect(described_class.where(input_id: response.id).pluck(:question_category).uniq).to eq [nil]
    end

    it 'has no rows for skipped questions' do
      create(:idea_status_proposed)
      empty_response = create(:native_survey_response, project: project)

      expect(described_class.where(input_id: empty_response.id)).to be_empty
    end
  end

  describe 'community monitor answers' do
    let(:project) { create(:community_monitor_project) }
    let(:form) { create(:custom_form, participation_context: project.phases.first) }

    it 'exposes the question category, defaulting to other' do
      categorised = create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'governance_and_trust')
      uncategorised = create(:custom_field_sentiment_linear_scale, resource: form)
      create(:idea_status_proposed)
      response = create(:native_survey_response, project: project)
      response.custom_field_answers.create!(key: categorised.key, value: 2)
      response.custom_field_answers.create!(key: uncategorised.key, value: 5)
      rows = described_class.where(input_id: response.id)

      expect(rows.find_by!(question_id: categorised.id).question_category).to eq 'governance_and_trust'
      expect(rows.find_by!(question_id: uncategorised.id).question_category).to eq 'other'
    end

    it 'documents every question category' do
      description = described_class.field_descriptions['question_category']

      expect(CustomField::QUESTION_CATEGORIES).to all(satisfy { |category| description.include?("'#{category}'") })
    end
  end

  describe 'idea form answers (form on the project)' do
    it 'exposes extra idea-form answers' do
      project = create(:single_phase_ideation_project)
      form = create(:custom_form, participation_context: project)
      question = create(:custom_field, resource: form, input_type: 'text')
      idea = create(:idea, project: project)
      idea.custom_field_answers.create!(key: question.key, value: 'By bicycle')
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
    response.custom_field_answers.create!(key: ranking.key, value: %w[option1 option2])

    expect(described_class.where(input_id: response.id)).to be_empty
  end
end
