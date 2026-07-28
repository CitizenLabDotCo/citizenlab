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

      expect(response.structured_content).to match(
        container_type: 'project',
        container_id: project.id,
        participation_method: 'ideation',
        fields_last_updated_at: nil, # No persisted form yet, so no stale-data timestamp.
        constraints: be_a(Hash),
        fields: be_an(Array)
      )

      field_codes = response.structured_content[:fields].pluck(:code)
      expect(field_codes).to include('title_multiloc', 'body_multiloc')

      title_multiloc_locks = response.structured_content.dig(:constraints, :title_multiloc, :locks)
      expect(title_multiloc_locks).to be_present
    end
  end

  context 'with a native survey phase' do
    let(:phase) { create(:native_survey_phase) }
    let(:custom_form) { create(:custom_form, participation_context: phase) }

    it 'returns the fields in display order with the stale-data timestamp' do
      field_a, field_b = create_list(:custom_field, 2, resource: custom_form)
      select_field = create(:custom_field_select, :with_options, resource: custom_form)

      response = run_mcp_tool(
        described_class,
        params: { container_type: 'phase', container_id: phase.id },
        current_user:
      )

      expect(response).not_to be_error

      expect(response.structured_content).to match(
        container_type: 'phase',
        container_id: phase.id,
        participation_method: 'native_survey',
        fields_last_updated_at: custom_form.reload.fields_last_updated_at,
        constraints: be_a(Hash),
        fields: be_an(Array)
      )

      fields = response.structured_content[:fields]
      expect(fields.pluck(:id)).to eq([field_a.id, field_b.id, select_field.id])
      expect(fields.first).to include(:input_type, :title_multiloc, :required)
      expect(fields.last[:options].pluck(:id)).to match_array(select_field.options.pluck(:id))
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
    expect(response.content.sole[:text]).to include("Unsupported participation method: 'information'")
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
