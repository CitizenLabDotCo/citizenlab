# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhasePermission do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:phase, project: project, with_permissions: true) }
  let(:permission) { phase.permissions.first }
  let(:params) do
    {
      phase_id: phase.id,
      action: permission.action,
      permitted_by: 'admins_moderators'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'updates the permission' do
      response = nil
      expect { response = run_mcp_tool(described_class, params:, current_user:) }
        .to change { permission.reload.permitted_by }.to('admins_moderators')

      expect(response).not_to be_error
    end

    context 'with an invalid action' do
      let(:params) do
        {
          phase_id: phase.id,
          action: 'nonexistent_action',
          permitted_by: 'admins_moderators'
        }
      end

      it 'returns the invalid-action error' do
        response = run_mcp_tool(described_class, params:, current_user:)

        expect(response).to be_error
        expect(response.content.first[:text]).to match(/does not apply to this phase/)
      end
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not update the permission' do
      response = nil
      expect { response = run_mcp_tool(described_class, params:, current_user:) }
        .not_to change { permission.reload.permitted_by }

      expect(response).to be_unauthorized_project
    end
  end
end
