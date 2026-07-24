# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetFormFields do
  let_it_be(:current_user) { create(:super_admin) }

  context 'with an ideation project' do
    let(:project) { create(:project_with_active_ideation_phase) }

    it 'returns the default form fields and the built-in constraints' do
      response = run_mcp_tool(
        described_class,
        params: { container_type: 'project', container_id: project.id },
        current_user:
      )

      expect(response).not_to be_error
      expect(response.structured_content[:container_id]).to eq(project.id)
      expect(response.structured_content[:participation_method]).to eq('ideation')

      field_codes = response.structured_content[:fields].pluck(:code)
      expect(field_codes).to include('title_multiloc', 'body_multiloc')

      expect(response.structured_content[:constraints]).to include(:title_multiloc)
      expect(response.structured_content.dig(:constraints, :title_multiloc, :locks)).to be_present
    end
  end

  context 'with a native survey phase' do
    let(:phase) { create(:native_survey_phase) }
    let(:custom_form) { create(:custom_form, participation_context: phase) }

    it 'returns the fields in display order with the stale-data timestamp' do
      field_a = create(:custom_field, resource: custom_form, input_type: 'text')
      field_b = create(:custom_field, resource: custom_form, input_type: 'text')

      response = run_mcp_tool(
        described_class,
        params: { container_type: 'phase', container_id: phase.id },
        current_user:
      )

      expect(response).not_to be_error
      expect(response.structured_content[:participation_method]).to eq('native_survey')
      expect(response.structured_content[:fields_last_updated_at]).to be_present

      fields = response.structured_content[:fields]
      expect(fields.pluck(:id)).to eq([field_a.id, field_b.id])
      expect(fields.first).to include(:input_type, :title_multiloc, :required)
    end
  end

  it 'returns an error for an unsupported participation method' do
    phase = create(:information_phase)

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'phase', container_id: phase.id },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to include("Unsupported participation method: 'information'")
  end

  it 'returns a not-found error for a missing phase' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'phase', container_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_not_found('Container (phase)')
  end

  it 'returns a not-found error for a missing project' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'project', container_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_not_found('Container (project)')
  end
end
