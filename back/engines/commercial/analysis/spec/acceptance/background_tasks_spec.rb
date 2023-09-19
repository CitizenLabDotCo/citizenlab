# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Background tasks' do
  explanation 'A background task is a longer calculation that happens in the context of an analysis'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/background_tasks' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:task) { create(:auto_tagging_task, analysis: analysis) }
    let!(:other_task) { create(:auto_tagging_task) }
    let!(:old_task) { create(:q_and_a_task, analysis: analysis, state: 'completed', created_at: 26.hours.ago, ended_at: 25.hours.ago) }

    example_request 'List all background tasks' do
      expect(status).to eq(200)
      expect(response_data.size).to eq 1
      expect(response_data.dig(0, :id)).to eq(task.id)
      expect(response_data.dig(0, :attributes)).to include({
        state: 'in_progress',
        auto_tagging_method: 'controversial',
        started_at: kind_of(String),
        created_at: kind_of(String),
        ended_at: nil,
        progress: nil
      })
    end
  end

  get 'web_api/v1/analyses/:analysis_id/background_tasks/:id' do
    let(:task) { create(:auto_tagging_task) }
    let(:analysis_id) { task.analysis_id }
    let(:id) { task.id }

    example_request 'Get a background task by id' do
      expect(status).to eq(200)
      expect(response_data[:id]).to eq(task.id)
    end
  end
end
