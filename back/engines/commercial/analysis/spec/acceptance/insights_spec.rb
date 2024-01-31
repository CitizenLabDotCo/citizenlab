# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Insights' do
  explanation 'Insights are the items with appear in the insights panel during an analysis. A heterogeneous collection of different types that all contain something meaningful about a selection of inputs'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/insights' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:summary) { create(:summary, insight_attributes: { analysis: analysis }) }
    let!(:question) { create(:analysis_question, insight_attributes: { analysis: analysis }) }
    let!(:other_summary) { create(:summary) }

    example_request 'List all insights of an analysis' do
      assert_status 200
      expect(response_data.size).to eq(2)
      expect(response_data[0][:relationships]).to match({
        insightable: {
          data: {
            id: question.id,
            type: 'analysis_question'
          }
        }
      })
      expect(response_data[1]).to match({
        id: summary.insight_id,
        type: 'insight',
        relationships: {
          insightable: {
            data: {
              id: summary.id,
              type: 'summary'
            }
          }
        }
      })
      expect(json_response_body[:included].pluck(:id)).to match_array([summary.id, summary.background_task.id, question.id, question.background_task.id])
    end

    example_request 'Listing insights does not cause N+1 queries' do
      create_list(:summary, 3, insight_attributes: { analysis: analysis })

      expect do
        do_request
      end.not_to exceed_query_limit(1).with(/SELECT.*analysis_insights/)

      assert_status 200
    end
  end

  delete 'web_api/v1/analyses/:analysis_id/insights/:id' do
    let!(:summary) { create(:summary) }
    let(:analysis_id) { summary.analysis.id }
    let(:id) { summary.insight_id }

    example 'Delete an insight' do
      expect { do_request }.to change(Analysis::Summary, :count).from(1).to(0)
        .and(change(Analysis::Insight, :count).from(1).to(0))
        .and(have_enqueued_job(LogActivityJob).with("Analysis::Summary/#{summary.id}", 'deleted', kind_of(User), anything, anything))
      expect(response_status).to eq 200
      expect { Analysis::Insight.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { Analysis::Summary.find(summary.id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  post 'web_api/v1/analyses/:analysis_id/insights/:id/toggle_bookmark' do
    let!(:summary) { create(:summary) }
    let(:analysis_id) { summary.analysis.id }
    let(:id) { summary.insight_id }

    example 'Toggle bookmarked attribute on an insight' do
      expect { do_request }.to change { Analysis::Insight.find(id).bookmarked }.from(false).to(true)
      expect(response_status).to eq 200

      expect { do_request }.to change { Analysis::Insight.find(id).bookmarked }.from(true).to(false)
      expect(response_status).to eq 200
    end
  end

  post 'web_api/v1/analyses/:analysis_id/insights/:id/rate' do
    parameter :rating, 'The rating value, can be vote-up or vote-down'

    let!(:summary) { create(:summary) }
    let(:analysis_id) { summary.analysis.id }
    let(:id) { summary.insight_id }

    example 'Up-vote an insight' do
      expect { do_request(rating: 'vote-up') }.to have_enqueued_job(LogActivityJob).with(Analysis::Insight.find(id), 'rated', kind_of(User), anything, payload: { rating: 'vote-up' })
      expect(response_status).to eq 201
    end

    example 'Down-vote an insight' do
      expect { do_request(rating: 'vote-down') }.to have_enqueued_job(LogActivityJob).with(Analysis::Insight.find(id), 'rated', kind_of(User), anything, payload: { rating: 'vote-down' })
      expect(response_status).to eq 201
    end
  end
end
