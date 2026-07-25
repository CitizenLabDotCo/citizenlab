# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPhasePermissions do
  let(:current_user) { create(:super_admin) }

  it 'lists the permissions of the phase' do
    phase = create(:phase, with_permissions: true)
    create(:phase, with_permissions: true) # phase with its own permissions

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:phase_id]).to eq(phase.id)
    permissions = response.structured_content[:permissions]
    expect(permissions).to be_an(Array)
    expect(permissions.pluck(:action)).to match_array(phase.permissions.pluck(:action))
  end

  it 'serializes permission fields' do
    phase = create(:phase, with_permissions: true)

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    expect(response.structured_content[:permissions].first)
      .to include(:action, :permitted_by, :group_ids)
  end

  it 'returns a not-found error when the phase is missing' do
    response = run_mcp_tool(described_class, params: { phase_id: SecureRandom.uuid }, current_user:)

    expect(response).to be_not_found('Phase')
  end
end
