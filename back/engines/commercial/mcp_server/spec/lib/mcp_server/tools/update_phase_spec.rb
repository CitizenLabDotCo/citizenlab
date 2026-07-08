# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhase do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project, :draft) }
  let(:phase) { create(:phase, project:) }

  describe '#input_schema' do
    it "reuses create_phase's schema without project_id" do
      create_properties = McpServer::Tools::CreatePhase.new.input_schema[:properties].except(:project_id)
      schema = described_class.new.input_schema

      expect(schema[:properties].keys).to eq([:phase_id, *create_properties.keys])
      expect(schema[:required]).to eq(%w[phase_id])
      expect(schema[:additionalProperties]).to be(false)
    end
  end

  context 'when the project is draft' do
    it 'updates only the given attributes' do
      response = nil
      expect { response = run_mcp_tool(described_class, params: { phase_id: phase.id, commenting_enabled: false }, current_user:) }
        .to change { phase.reload.commenting_enabled }.to(false)
        .and not_change { phase.reload.title_multiloc }

      expect(response).not_to be_error
      expect(response.structured_content[:id]).to eq(phase.id)
    end

    it 'merges multiloc fields per locale' do
      phase.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

      response = run_mcp_tool(
        described_class,
        params: { phase_id: phase.id, title_multiloc: { 'en' => 'New' } },
        current_user:
      )

      expect(response).not_to be_error
      expect(phase.reload.title_multiloc).to eq('en' => 'New', 'fr-FR' => 'Ancien')
      expect(response.structured_content[:title_multiloc]).to eq('en' => 'New', 'fr-FR' => 'Ancien')
    end

    it 'records manual voters through the dedicated setter' do
      phase = create(:single_voting_phase, project:)

      response = run_mcp_tool(
        described_class,
        params: { phase_id: phase.id, manual_voters_amount: 25 },
        current_user:
      )

      expect(response).not_to be_error
      expect(phase.reload.manual_voters_amount).to eq(25)
      expect(phase.manual_voters_last_updated_by).to eq(current_user)
      expect(phase.manual_voters_last_updated_at).to be_present
    end

    it 'rejects changing the participation method when the phase has inputs' do
      create(:idea, project:, phases: [phase])

      response = run_mcp_tool(
        described_class,
        params: { phase_id: phase.id, participation_method: 'information' },
        current_user:
      )

      expect(response).to be_error
      expect(response.structured_content[:errors].pluck(:attribute)).to include('participation_method')
      expect(phase.reload.participation_method).to eq('ideation')
    end

    it 'changes the participation method when the phase has no inputs' do
      response = run_mcp_tool(
        described_class,
        params: { phase_id: phase.id, participation_method: 'information' },
        current_user:
      )

      expect(response).not_to be_error
      expect(phase.reload.participation_method).to eq('information')
    end
  end

  context 'when the project is published' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'published' }) }

    it 'returns an isError response and does not update the phase' do
      response = nil
      expect { response = run_mcp_tool(described_class, params: { phase_id: phase.id, commenting_enabled: false }, current_user:) }
        .not_to change { phase.reload.commenting_enabled }

      expect(response).to be_unauthorized_project
    end
  end

  it 'returns a not-found error when the phase is missing' do
    response = run_mcp_tool(
      described_class,
      params: { phase_id: SecureRandom.uuid, commenting_enabled: false },
      current_user:
    )

    expect(response).to be_not_found('Phase')
  end
end
