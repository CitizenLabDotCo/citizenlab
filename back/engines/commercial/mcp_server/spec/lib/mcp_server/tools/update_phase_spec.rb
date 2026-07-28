# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhase do
  let(:current_user) { create(:super_admin) }
  let(:phase) { create(:phase) }

  it 'updates the passed fields' do
    response = run_mcp_tool(
      described_class,
      params: { phase_id: phase.id, title_multiloc: { 'en' => 'Renamed' } },
      current_user:
    )

    expect(response).not_to be_error
    expect(phase.reload.title_multiloc['en']).to eq('Renamed')
  end

  # The feature gates shared with create_phase (PhaseFeatureGuard) also cover updates.
  it 'rejects reacting_dislike_* fields when the disable_disliking feature is off' do
    SettingsService.new.deactivate_feature!('disable_disliking')

    response = nil
    expect do
      response = run_mcp_tool(
        described_class,
        params: { phase_id: phase.id, reacting_dislike_enabled: true },
        current_user:
      )
    end.not_to change { phase.reload.updated_at }

    expect(response).to be_error
    expect(response.content.first[:text]).to include("'disable_disliking' feature")
  end
end
