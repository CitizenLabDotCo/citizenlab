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
      parameter :tags_ids, 'Tags the auto-tagging should use as target. Only relevant for a few methods'
      parameter :filters, 'Optional filters, in case the auto tagging should happen on a subset of inputs only'
    end

    let(:project) { create(:single_phase_ideation_project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:id) { analysis.id }
    # let(:input) { create(:idea, project: project) }

    context do
      let(:auto_tagging_method) { 'controversial' }

      example 'Launch controversial auto tagging' do
        expect { do_request }
          .to have_enqueued_job(Analysis::AutoTaggingJob)
          .and change(Analysis::BackgroundTask, :count).from(0).to(1)
          .and have_enqueued_job(LogActivityJob).with(anything, 'created', anything, anything)
        expect(status).to eq 202
        expect(Analysis::BackgroundTask.first).to have_attributes({
          progress: nil,
          type: 'Analysis::AutoTaggingTask',
          auto_tagging_method: 'controversial',
          filters: {},
          state: 'queued',
          created_at: be_present,
          updated_at: be_present,
          ended_at: nil
        })
      end
    end

    context do
      let(:tag) { create(:tag, analysis: analysis, tag_type: 'custom') }
      let(:auto_tagging_method) { 'few_shot_classification' }
      let(:filters) { { 'published_at_from' => '2022-01-01' } }
      let(:tags_ids) { [tag.id] }

      example 'Launch few_shot_classification auto tagging, with filters', document: false do
        expect { do_request }
          .to have_enqueued_job(Analysis::AutoTaggingJob)
          .and change(Analysis::BackgroundTask, :count).from(0).to(1)
        expect(status).to eq 202
        expect(Analysis::BackgroundTask.first).to have_attributes({
          progress: nil,
          type: 'Analysis::AutoTaggingTask',
          auto_tagging_method: 'few_shot_classification',
          filters: { 'published_at_from' => '2022-01-01' },
          tags_ids: [tag.id],
          state: 'queued',
          created_at: be_present,
          updated_at: be_present,
          ended_at: nil
        })
      end
    end
  end
end
