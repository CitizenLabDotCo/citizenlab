# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPhasePermissions do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists the permissions of the phase' do
    phase = create(:phase, with_permissions: true)
    create(:phase, with_permissions: true) # phase with its own permissions

    response = list(phase_id: phase.id)

    expect(response).not_to be_error

    expect(response.structured_content).to match(
      phase_id: phase.id,
      permissions: [
        a_hash_including(action: 'posting_idea'),
        a_hash_including(action: 'commenting_idea'),
        a_hash_including(action: 'reacting_idea'),
        a_hash_including(action: 'attending_event')
      ]
    )
  end

  it 'serializes permission fields' do
    phase = create(:phase, with_permissions: true)

    response = list(phase_id: phase.id)

    expect(response.structured_content[:permissions].first)
      .to include(:action, :permitted_by, :group_ids)
  end

  it 'returns a not-found error when the phase is missing' do
    response = list(phase_id: SecureRandom.uuid)

    expect(response).to be_not_found('Phase')
  end
end
