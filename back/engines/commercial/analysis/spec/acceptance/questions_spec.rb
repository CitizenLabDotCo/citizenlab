# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Questions' do
  explanation 'A question the user asks combined with the answer generated by an AI model, in the scope of an analysis'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/questions/:id' do
    let(:analysis) { create(:analysis) }
    let(:idea) { create(:idea, project: analysis.project) }
    let(:analysis_id) { analysis.id }
    let(:question) { create(:analysis_question, insight_attributes: { analysis: analysis, inputs_ids: [idea.id] }) }
    let(:analysis_id) { question.analysis_id }
    let(:id) { question.id }

    example_request 'Get one question by id' do
      expect(status).to eq 200
      expect(response_data).to match({
        id: id,
        type: 'analysis_question',
        attributes: {
          question: kind_of(String),
          answer: nil,
          filters: {},
          inputs_count: 1,
          custom_field_ids: {},
          accuracy: nil,
          created_at: kind_of(String),
          updated_at: kind_of(String),
          generated_at: nil,
          missing_inputs_count: 0
        },
        relationships: {
          background_task: {
            data: {
              type: 'background_task',
              id: kind_of(String)
            }
          }
        }
      })
    end
  end

  post 'web_api/v1/analyses/:analysis_id/questions' do
    parameter :question, 'The question posed by the user', required: true, scope: :question
    with_options scope: %i[question filters] do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_ids, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical or date fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical or date fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :published_at_from, 'Filter by input publication date, after or equal to', type: :date
      parameter :published_at_to, 'Filter by input publication date, before or equal to', type: :date
      parameter :reactions_from, 'Filter by number of reactions on the input, larger than or equal to', type: :integer
      parameter :reactions_to, 'Filter by number of reactions on the input, smaller than or equal to', type: :integer
      parameter :votes_from, 'Filter by number of votes on the input, larger than or equal to', type: :integer
      parameter :votes_to, 'Filter by number of votes on the input, smaller than or equal to', type: :integer
      parameter :comments_from, 'Filter by number of comments on the input, larger than or equal to', type: :integer
      parameter :comments_to, 'Filter by number of comments on the input, smaller than or equal to', type: :integer
    end

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let(:tag) { create(:tag, analysis: analysis) }
    let(:question) { 'What are the main arguments raised against expanding the pilot?' }

    example 'Generate a posed question' do
      expect { do_request(question: { filters: { tag_ids: [tag.id], comments_from: 5 } }) }
        .to have_enqueued_job(Analysis::QAndAJob)
        .and change(Analysis::BackgroundTask, :count).from(0).to(1)
      expect(status).to eq 201
      expect(response_data).to match({
        id: kind_of(String),
        type: 'analysis_question',
        attributes: {
          question: question,
          answer: nil,
          filters: {
            comments_from: 5,
            tag_ids: [tag.id]
          },
          inputs_count: 0,
          custom_field_ids: { main_custom_field_id: analysis.main_custom_field_id, additional_custom_field_ids: analysis.additional_custom_field_ids },
          accuracy: 0.8,
          missing_inputs_count: 0,
          created_at: kind_of(String),
          updated_at: kind_of(String),
          generated_at: nil
        },
        relationships: {
          background_task: {
            data: {
              type: 'background_task',
              id: kind_of(String)
            }
          }
        }
      })
      background_task = Analysis::BackgroundTask.first
      expect(json_response_body[:included].pluck(:id)).to include(background_task.id)

      expect(background_task).to have_attributes({
        progress: nil,
        type: 'Analysis::QAndATask',
        state: 'queued',
        created_at: be_present,
        updated_at: be_present,
        ended_at: nil
      })
    end
  end

  post 'web_api/v1/analyses/:analysis_id/questions/:id/regenerate' do
    let(:state) { 'succeeded' }
    let(:background_task) { create(:q_and_a_task, state: state, ended_at: Time.now) }
    let(:analysis) { create(:analysis) }
    let(:filters) { { reactions_from: 5 } }
    let!(:question) { create(:analysis_question, question: nil, insight_attributes: { filters: filters, analysis: analysis }, background_task: background_task) }
    let(:analysis_id) { analysis.id }
    let(:id) { question.id }

    example 'Regenerate a question' do
      expect { do_request }
        .to have_enqueued_job(Analysis::QAndAJob)
        .and change(Analysis::BackgroundTask, :count).from(1).to(2)
      expect(status).to eq 201
      new_background_task = Analysis::BackgroundTask.find_by(state: 'queued')
      expect(response_data).to match({
        id: kind_of(String),
        type: 'analysis_question',
        attributes: {
          question: nil,
          answer: nil,
          filters: { reactions_from: 5 },
          inputs_count: 0,
          custom_field_ids: {},
          accuracy: 0.8,
          missing_inputs_count: 0,
          created_at: kind_of(String),
          updated_at: kind_of(String),
          generated_at: nil
        },
        relationships: {
          background_task: {
            data: {
              type: 'background_task',
              id: new_background_task.id
            }
          }
        }
      })
      expect(json_response_body[:included].pluck(:id)).to include(new_background_task.id)

      expect(new_background_task).to have_attributes({
        progress: nil,
        type: 'Analysis::QAndATask',
        state: 'queued',
        created_at: be_present,
        updated_at: be_present,
        ended_at: nil
      })
    end

    describe 'when the current task is queued or in progress' do
      let(:state) { 'queued' }

      example_request '[error] returns previous_task_not_yet_finished' do
        expect(status).to eq 422
        expect(json_response_body).to eq({ errors: { base: [{ error: 'previous_task_not_yet_finished' }] } })
      end
    end

    example '[error] too many inputs' do
      allow(Analysis::QAndAMethod::Base)
        .to receive(:plan)
        .and_return(Analysis::QAndAPlan.new(impossible_reason: :too_many_inputs))

      do_request

      expect(status).to eq 422
      expect(json_response_body).to eq({ errors: { base: [{ error: 'too_many_inputs' }] } })
    end
  end

  post 'web_api/v1/analyses/:analysis_id/questions/pre_check' do
    parameter :question, 'The question posed by the user', required: true, scope: :question
    with_options scope: %i[question filters] do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_ids, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical or date fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical or date fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :published_at_from, 'Filter by input publication date, after or equal to', type: :date
      parameter :published_at_to, 'Filter by input publication date, before or equal to', type: :date
      parameter :reactions_from, 'Filter by number of reactions on the input, larger than or equal to', type: :integer
      parameter :reactions_to, 'Filter by number of reactions on the input, smaller than or equal to', type: :integer
      parameter :votes_from, 'Filter by number of votes on the input, larger than or equal to', type: :integer
      parameter :votes_to, 'Filter by number of votes on the input, smaller than or equal to', type: :integer
      parameter :comments_from, 'Filter by number of comments on the input, larger than or equal to', type: :integer
      parameter :comments_to, 'Filter by number of comments on the input, smaller than or equal to', type: :integer
    end

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let(:reactions_from) { 7 }
    let(:tag) { create(:tag, analysis: analysis) }
    let(:tag_ids) { [tag.id] }
    let!(:input) { create(:idea, project: analysis.source_project) }

    example_request 'Pre-check whether the question with specified filters is possible' do
      expect(status).to eq 200
      expect(response_data).to match({
        id: kind_of(String),
        type: 'question_pre_check',
        attributes: {
          accuracy: 0.8,
          impossible_reason: nil
        }
      })
    end
  end
end
