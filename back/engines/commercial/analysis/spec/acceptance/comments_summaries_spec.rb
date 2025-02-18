# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comments summaries' do
  explanation 'An AI summary of the thread of comments on an idea.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/inputs/:input_id/comments_summary' do
    let(:analysis) { create(:analysis) }
    let(:idea) { create(:idea, project: analysis.project) }
    let(:comments) { create_list(:comment, 2, idea:) }
    let!(:comments_summary) { create(:comments_summary, idea:, comments_ids: comments.map(&:id), background_task: create(:comments_summarization_task, analysis:)) }
    let(:analysis_id) { analysis.id }
    let(:input_id) { idea.id }
    let(:id) { comments_summary.id }

    example 'Get the comments summary of a specific input id' do
      do_request

      expect(status).to eq 200
      expect(response_data).to include({
        id: id,
        type: 'comments_summary'
      })
      expect(response_data[:attributes]).to match({
        summary: kind_of(String),
        comments_count: 2,
        accuracy: nil,
        created_at: kind_of(String),
        updated_at: kind_of(String),
        generated_at: nil,
        missing_comments_count: 0
      })
      expect(response_data[:relationships]).to match({
        background_task: {
          data: {
            type: 'background_task',
            id: kind_of(String)
          }
        }
      })
    end

    example '[Error] Get the comments summary of a specific input id when it does not exist yet' do
      comments_summary.destroy!
      do_request
      expect(status).to eq 404
    end
  end

  post 'web_api/v1/analyses/:analysis_id/inputs/:input_id/comments_summary' do
    let(:analysis) { create(:analysis) }
    let(:idea) { create(:idea, project: analysis.project) }
    let!(:comments) { create_list(:comment, 2, idea:) }
    let(:analysis_id) { analysis.id }
    let(:input_id) { idea.id }

    context 'when the comments summary does not yet exist' do
      example 'Generate the comments summary of a specific input' do
        expect { do_request }
          .to have_enqueued_job(Analysis::CommentsSummarizationJob)
          .and change(Analysis::BackgroundTask, :count).from(0).to(1)
        expect(status).to eq 201
        background_task = Analysis::BackgroundTask.first
        expect(response_data).to include({
          id: kind_of(String),
          type: 'comments_summary'
        })
        expect(response_data[:attributes]).to match({
          summary: nil,
          comments_count: 2,
          accuracy: nil,
          missing_comments_count: 0,
          created_at: kind_of(String),
          updated_at: kind_of(String),
          generated_at: nil
        })
        expect(response_data[:relationships]).to match({
          background_task: {
            data: {
              type: 'background_task',
              id: background_task.id
            }
          }
        })
        expect(json_response_body[:included].pluck(:id)).to include(background_task.id)

        expect(background_task).to have_attributes({
          progress: nil,
          type: 'Analysis::CommentsSummarizationTask',
          state: 'queued',
          created_at: be_present,
          updated_at: be_present,
          ended_at: nil
        })
      end
    end

    context 'when the comments summary already exists' do
      let!(:existing_comments_summary) { create(:comments_summary, idea: idea, comments_ids: comments.map(&:id)) }

      example 'Regenerate the comments summary of a specific input' do
        expect { do_request }
          .to have_enqueued_job(Analysis::CommentsSummarizationJob)
          .and change(Analysis::BackgroundTask, :count).from(1).to(2)
        expect(status).to eq 201
        background_task = Analysis::BackgroundTask.find(json_response_body[:data][:relationships][:background_task][:data][:id])
        expect(response_data).to include({
          id: kind_of(String),
          type: 'comments_summary'
        })
        expect(response_data[:id]).not_to eq existing_comments_summary.id
        expect(background_task).to have_attributes({
          progress: nil,
          type: 'Analysis::CommentsSummarizationTask',
          state: 'queued',
          created_at: be_present,
          updated_at: be_present,
          ended_at: nil
        })
      end
    end
  end
end
