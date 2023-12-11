# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::SideFxImportIdeasService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }
  let(:ideas) { create_list(:idea, 3) }
  let(:users) { create_list(:user, 2) }

  describe 'after_success' do
    context 'project import' do
      let(:project) { create(:single_phase_ideation_project) }

      it "logs a 'successful' action job with stats against a project" do
        expect { service.after_success(current_user, project.id, ideas, users) }
          .to have_enqueued_job(LogActivityJob).with(
            project.id,
            'bulk_import_ideas_succeeded',
            current_user,
            ideas.last.created_at,
            { payload: { ideas_created: 3, users_created: 2 } }
          )
      end
    end

    context 'global import' do
      it "logs a 'successful' action job with stats against a tenant" do
        expect { service.after_success(current_user, nil, ideas, users) }
          .to have_enqueued_job(LogActivityJob).with(
            Tenant.current,
            'bulk_import_ideas_succeeded',
            current_user,
            ideas.last.created_at,
            { payload: { ideas_created: 3, users_created: 2 } }
          )
      end
    end
  end
end
