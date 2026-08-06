# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::SideFxBulkImportService do
  let(:service) { described_class.new }

  let_it_be(:current_user, reload: true) { create(:user) }
  let_it_be(:ideas, reload: true) { create_list(:idea, 3) }
  let_it_be(:users, reload: true) { create_list(:user, 2) }
  let_it_be(:phase, reload: true) { create(:phase) }

  describe 'after_success' do
    it "logs a 'successful' action job with stats against a phase" do
      expect { service.after_success(current_user, phase, 'idea', 'xlsx', ideas, users) }
        .to have_enqueued_job(LogActivityJob).with(
          phase,
          'bulk_import_succeeded',
          current_user,
          ideas.last.created_at,
          { payload: { model: 'idea', format: 'xlsx', items_created: 3, users_created: 2 },
            project_id: phase.project_id }
        )
    end

    it 'enqueues a heatmap generation job for each analysis' do
      analysis = create(:analysis, project: phase.project)
      expect { service.after_success(current_user, phase, 'idea', 'xlsx', ideas, users) }
        .to have_enqueued_job(Analysis::HeatmapGenerationJob).with(
          analysis
        )
    end
  end

  describe 'after_failure' do
    it "logs a 'failed' action job with model and format against a phase" do
      time_now = Time.now
      allow(Time).to receive(:now).and_return(time_now)
      expect { service.after_failure(current_user, phase.id, 'idea', 'xlsx', 'bulk_import_error') }
        .to have_enqueued_job(LogActivityJob).with(
          phase.id,
          'bulk_import_failed',
          current_user,
          time_now.to_i,
          { payload: { model: 'idea', format: 'xlsx', error: 'bulk_import_error' } }
        )
    end
  end
end
