# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListCauses do
  let_it_be(:current_user, reload: true) { create(:super_admin) }
  let_it_be(:project, reload: true) { create(:project) }
  let_it_be(:phase, reload: true) { create(:volunteering_phase, project:) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists causes of the phase in display order' do
    cause_a = create(:cause, phase:)
    cause_b = create(:cause, phase:)
    create(:cause) # cause in another phase
    cause_b.move_to_top

    response = list(phase_id: phase.id)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([cause_b.id, cause_a.id])
  end

  it 'serializes cause fields' do
    create(:cause, phase:)

    response = list(phase_id: phase.id)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :volunteers_count, :ordering)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { phase_id: phase.id } }
  end

  it 'returns a not-found error when the phase is missing' do
    response = list(phase_id: SecureRandom.uuid)

    expect(response).to be_not_found('Phase')
  end
end
