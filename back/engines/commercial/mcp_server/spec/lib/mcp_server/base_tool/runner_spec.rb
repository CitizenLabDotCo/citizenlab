# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Runner do
  describe '#authorize_project!' do
    let(:runner) { described_class.new(params: {}, server_context: {}, current_user: nil) }

    def authorize!(project)
      runner.send(:authorize_project!, project)
    end

    it 'allows draft projects' do
      expect { authorize!(create(:project, :draft)) }.not_to raise_error
    end

    it 'refuses published projects on every lifecycle stage other than demo and trial' do
      project = create(:project)

      %w[active expired_trial churned not_applicable].each do |stage|
        change_lifecycle_stage(stage)
        expect { authorize!(project) }
          .to raise_error(Pundit::NotAuthorizedErrorWithReason), "expected refusal on #{stage}"
      end
    end

    %w[demo trial].each do |stage|
      context "on a #{stage} platform" do
        before { change_lifecycle_stage(stage) }

        it 'allows published projects' do
          expect { authorize!(create(:project)) }.not_to raise_error
        end

        it 'allows archived projects' do
          project = create(:project, admin_publication_attributes: { publication_status: 'archived' })
          expect { authorize!(project) }.not_to raise_error
        end
      end
    end
  end
end
