# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhase do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project, :draft) }
  let(:phase) { create(:phase, project:) }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

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
      expect { response = run(phase_id: phase.id, commenting_enabled: false) }
        .to change { phase.reload.commenting_enabled }.to(false)
        .and not_change { phase.reload.title_multiloc }

      expect(response).not_to be_error
      expect(response.structured_content[:id]).to eq(phase.id)
    end

    it 'merges multiloc fields per locale' do
      phase.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

      response = run(phase_id: phase.id, title_multiloc: { 'en' => 'New' })

      expect(response).not_to be_error
      expect(phase.reload.title_multiloc).to eq('en' => 'New', 'fr-FR' => 'Ancien')
      expect(response.structured_content[:title_multiloc]).to eq('en' => 'New', 'fr-FR' => 'Ancien')
    end

    it 'records manual voters through the dedicated setter' do
      phase = create(:single_voting_phase, project:)

      response = run(phase_id: phase.id, manual_voters_amount: 25)

      expect(response).not_to be_error
      expect(phase.reload).to have_attributes(
        manual_voters_amount: 25,
        manual_voters_last_updated_by: current_user,
        manual_voters_last_updated_at: be_present
      )
    end

    it 'rejects changing the participation method when the phase has inputs' do
      create(:idea, project:, phases: [phase])

      response = nil
      expect { response = run(phase_id: phase.id, participation_method: 'information') }
        .not_to change { phase.reload.participation_method }

      expect(response).to be_error

      error = response.structured_content[:errors].sole
      expect(error).to include(
        attribute: 'participation_method',
        error: :has_inputs,
        message: be_present
      )
    end

    it 'changes the participation method when the phase has no inputs' do
      response = run(phase_id: phase.id, participation_method: 'information')

      expect(response).not_to be_error
      expect(phase.reload.participation_method).to eq('information')
    end
  end

  context 'when the project is published' do
    let(:project) { create(:project) } # Projects are published by default.

    it 'returns an isError response and does not update the phase' do
      response = nil
      expect { response = run(phase_id: phase.id, commenting_enabled: false) }
        .not_to change { phase.reload.commenting_enabled }

      expect(response).to be_unauthorized_project
    end
  end

  it 'returns a not-found error when the phase is missing' do
    response = run(phase_id: SecureRandom.uuid, commenting_enabled: false)

    expect(response).to be_not_found('Phase')
  end
end
