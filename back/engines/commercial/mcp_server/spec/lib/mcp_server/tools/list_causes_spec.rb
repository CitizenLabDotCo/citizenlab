# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListCauses do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }
  let(:phase) { create(:volunteering_phase, project:) }

  it 'lists causes of the phase in display order' do
    cause_a = create(:cause, phase:)
    cause_b = create(:cause, phase:)
    create(:cause) # cause in another phase
    cause_b.move_to_top

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([cause_b.id, cause_a.id])
  end

  it 'serializes cause fields' do
    create(:cause, phase:)

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :volunteers_count, :ordering)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { phase_id: phase.id } }
    let(:create_record) { -> { create(:cause, phase:) } }
  end

  it 'returns an empty list when the phase does not exist' do
    response = run_mcp_tool(described_class, params: { phase_id: SecureRandom.uuid }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data]).to eq([])
  end
end
