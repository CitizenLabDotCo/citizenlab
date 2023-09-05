# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Summaries' do
  explanation 'A text summary of a collection of inputs in the scope of an analysis'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/summaries/:id' do
    let(:summary) { create(:summary) }
    let(:analysis_id) { summary.analysis_id }
    let(:id) { summary.id }

    example_request 'Get one summary by id' do
      expect(status).to eq 200
      expect(response_data).to match({
        id: id,
        type: 'summary',
        attributes: {
          summary: kind_of(String),
          filters: {},
          accuracy: nil,
          created_at: kind_of(String),
          updated_at: kind_of(String)
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

  post 'web_api/v1/analyses/:analysis_id/summaries' do
    with_options scope: %i[summary filters] do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_ids, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :'input_custom_<uuid>_from', 'Filter by custom field value of the input for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>_to', 'Filter by custom field value of the input for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>', 'Filter by custom field value of the input, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
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

    example 'Generate a summary' do
      expect { do_request(summary: { filters: { tag_ids: [tag.id], reactions_from: 7 } }) }
        .to have_enqueued_job(Analysis::SummarizationJob)
        .and change(Analysis::BackgroundTask, :count).from(0).to(1)
      expect(status).to eq 201
      expect(response_data).to match({
        id: kind_of(String),
        type: 'summary',
        attributes: {
          summary: nil,
          filters: {
            reactions_from: 7,
            tag_ids: [tag.id]
          },
          accuracy: 0.8,
          created_at: kind_of(String),
          updated_at: kind_of(String)
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
        type: 'Analysis::SummarizationTask',
        state: 'queued',
        created_at: be_present,
        updated_at: be_present,
        ended_at: nil
      })
    end

    example 'Generate a summary for inputs without tags (tag_ids: [null] body)', document: false do
      do_request(summary: { filters: { tag_ids: [nil] } })
      expect(status).to eq 201
      expect(response_data.dig(:attributes, :filters, :tag_ids)).to eq([nil])
    end
  end

  post 'web_api/v1/analyses/:analysis_id/summaries/pre_check' do
    with_options scope: %i[summary filters] do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_ids, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :'input_custom_<uuid>_from', 'Filter by custom field value of the input for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>_to', 'Filter by custom field value of the input for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>', 'Filter by custom field value of the input, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
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
    let!(:idea) { create(:idea, project: analysis.source_project) }

    example_request 'Pre-check whether the summary with specified filters is possible' do
      expect(status).to eq 200
      expect(response_data).to match({
        id: kind_of(String),
        type: 'summary_pre_check',
        attributes: {
          accuracy: 0.8,
          impossible_reason: nil
        }
      })
    end
  end
end
