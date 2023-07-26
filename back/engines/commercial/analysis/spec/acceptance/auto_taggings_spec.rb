# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AutoTaggings' do
  explanation 'An auto tagging is a process that automatically assigns tags to inputs'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analyses/:id/auto_taggings' do
    with_options scope: :auto_tagging do
      parameter :auto_tagging_method, 'Defines how tags should be assigned. One of []'
    end

    let(:project) { create(:project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:input) { create(:idea, project: project) }

    example 'Launch controversial auto tagging' do
      expect { do_request }.to have_enqueued_job(Analysis::AutoTaggingJob).and.to_change(Analysis::BackgroundTask, :count).from(0).to(1)
      expect(status).to eq 202
      expect(response_data.dig(:relationships, :background_task)).to match({
        type: 'analysis_background_task',
        id: kind_of(String)
      })
      expect(Analysys::BackgroundTask.first).to have_attributes({
        progress: nil,
        type: 'Analysis::AutoTaggingTask',
        tag_type: 'controversial',
        state: 'queued',
        created_at: kind_of(String),
        ended_at: nil
      })
    end
  end
end
