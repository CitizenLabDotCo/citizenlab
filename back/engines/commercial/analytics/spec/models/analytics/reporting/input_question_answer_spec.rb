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

    it 'labels single-select answers with the option title' do
      select_question.options.find_by!(key: 'option1').update!(title_multiloc: { 'en' => 'Yes' })
      row = described_class.find_by!(input_id: response.id, question_id: select_question.id)

      expect(row.value_label).to eq 'Yes'
    end

    it 'labels multi-select answers with the option title' do
      multiselect_question.options.find_by!(key: 'option2').update!(title_multiloc: { 'en' => 'Cycling' })
      row = described_class.find_by!(input_id: response.id, question_id: multiselect_question.id, value_text: 'option2')

      expect(row.value_label).to eq 'Cycling'
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

    it 'has no question_category outside the community monitor, as CustomField#question_category' do
      row = described_class.find_by!(input_id: response.id, question_id: scale_question.id)

      expect(row.question_category).to be_nil
      expect(scale_question.reload.question_category).to be_nil
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

    it 'gives the same question category as CustomField#question_category' do
      categorised = create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'governance_and_trust')
      uncategorised = create(:custom_field_sentiment_linear_scale, resource: form)
      create(:idea_status_proposed)
      response = create(:native_survey_response, project: project)
      response.custom_field_answers.create!(key: categorised.key, value: 2)
      response.custom_field_answers.create!(key: uncategorised.key, value: 5)
      rows = described_class.where(input_id: response.id)

      expect(rows.find_by!(question_id: categorised.id).question_category).to eq categorised.reload.question_category
      expect(rows.find_by!(question_id: uncategorised.id).question_category).to eq uncategorised.reload.question_category
    end

    # The view sets question_category only for community monitor survey
    # questions. It names that method directly because the database can't run
    # the Ruby check supports_custom_field_categories?. If another method starts
    # supporting categories, this fails: add that method to the view too.
    it 'categorises only the participation methods that support categories' do
      supporting = ParticipationMethod::Base.all_methods
        .select { |method| method.new(Phase.new).supports_custom_field_categories? }
        .map(&:method_str)

      expect(supporting).to eq ['community_monitor_survey']
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

  describe 'structurally complex question types' do
    let(:project) { create(:single_phase_native_survey_project) }
    let(:form) { create(:custom_form, participation_context: project.phases.first) }
    let(:response) do
      create(:idea_status_proposed)
      create(:native_survey_response, project: project)
    end

    it 'explodes ranking answers into one row per option, with its rank and title' do
      ranking = create(:custom_field_ranking, :with_options, resource: form)
      response.custom_field_answers.create!(key: ranking.key, value: %w[by_bike by_train])
      rows = described_class.where(input_id: response.id).order(:value_numeric)

      expect(rows.pluck(:value_text, :value_numeric, :value_label))
        .to eq [['by_bike', 1, 'By bike'], ['by_train', 2, 'By train']]
    end

    it 'explodes matrix answers into one row per answered statement, with point and statement labels' do
      matrix = create(:custom_field_matrix_linear_scale, resource: form)
      response.custom_field_answers.create!(key: matrix.key, value: { 'send_more_animals_to_space' => 1, 'ride_bicycles_more_often' => 3 })
      rows = described_class.where(input_id: response.id).order(:value_numeric)

      expect(rows.pluck(:statement_key, :statement_label, :value_numeric, :value_label, :value_text)).to eq [
        ['send_more_animals_to_space', 'We should send more animals into space', 1, 'Strongly disagree', nil],
        ['ride_bicycles_more_often', 'We should ride our bicycles more often', 3, nil, nil]
      ]
    end

    it 'records a file upload answer without the file name' do
      file_upload = create(:custom_field_file_upload, resource: form)
      response.custom_field_answers.create!(key: file_upload.key, value: { 'id' => SecureRandom.uuid, 'name' => 'jane_doe_cv.pdf' })
      row = described_class.find_by!(input_id: response.id)

      expect(row.question_type).to eq 'file_upload'
      expect(row.attributes.values).not_to include(a_string_including('jane_doe'))
    end

    it 'excludes mapping questions' do
      point = create(:custom_field_point, resource: form)
      response.custom_field_answers.create!(key: point.key, value: { 'type' => 'Point', 'coordinates' => [4.35, 50.85] })

      expect(described_class.where(input_id: response.id)).to be_empty
    end
  end
end
