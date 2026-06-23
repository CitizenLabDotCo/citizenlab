# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhasePermission do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:phase, project: project, with_permissions: true) }
  let(:permission) { phase.permissions.first }
  let(:params) do
    {
      phase_id: phase.id,
      action: permission.action,
      permitted_by: 'users'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'updates the permission' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).not_to be_error
      expect(permission.reload.permitted_by).to eq('users')
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not update the permission' do
      original_permitted_by = permission.permitted_by
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(permission.reload.permitted_by).to eq(original_permitted_by)
    end
  end

  context 'with an invalid action on a draft project' do
    let(:status) { 'draft' }
    let(:params) { super().merge(action: 'nonexistent_action') }

    it 'returns the invalid-action error' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_error
      expect(response.content.first[:text]).to match(/does not apply to this phase/)
    end
  end
end
