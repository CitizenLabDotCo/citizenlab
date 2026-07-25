# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePhasePermission do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:phase, project: project, with_permissions: true) }
  let(:permission) { phase.permissions.first }
  let(:params) do
    {
      phase_id: phase.id,
      action: permission.action,
      permitted_by: 'admins_moderators'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'updates the permission' do
      response = nil
      expect { response = run_mcp_tool(described_class, params:, current_user:) }
        .to change { permission.reload.permitted_by }.to('admins_moderators')

      expect(response).not_to be_error
    end

    it 'returns the serialized permission' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response.structured_content).to match(
        action: permission.action,
        permitted_by: 'admins_moderators',
        group_ids: [],
        demographic_questions: [],
        verification_expiry: nil,
        access_denied_explanation_multiloc: permission.access_denied_explanation_multiloc
      )
    end

    it 'sets and clears group restrictions' do
      groups = create_list(:group, 2)

      run_mcp_tool(described_class, params: params.merge(permitted_by: 'users', group_ids: groups.map(&:id)), current_user:)
      expect(permission.reload.group_ids).to match_array(groups.map(&:id))

      run_mcp_tool(described_class, params: params.merge(permitted_by: 'users', group_ids: []), current_user:)
      expect(permission.reload.group_ids).to be_empty
    end

    it 'replaces (does not merge) the access-denied explanation' do
      permission.update!(access_denied_explanation_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

      run_mcp_tool(
        described_class,
        params: params.merge(access_denied_explanation_multiloc: { 'en' => 'New' }),
        current_user:
      )

      expect(permission.reload.access_denied_explanation_multiloc).to eq('en' => 'New')
    end

    context 'with a verification method enabled' do
      before do
        config = AppConfiguration.instance
        config.settings['id_config'] = { allowed: true, enabled: true, id_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
        config.save!
      end

      it 'sets the verification expiry for a verified permitted_by' do
        response = run_mcp_tool(
          described_class,
          params: params.merge(permitted_by: 'verified', verification_expiry: 7),
          current_user:
        )

        expect(response).not_to be_error
        expect(permission.reload.permitted_by).to eq('verified')
        expect(permission.verification_expiry).to eq(7)
      end
    end

    it 'returns structured validation errors for an invalid update' do
      response = run_mcp_tool(described_class, params: params.merge(permitted_by: 'verified'), current_user:)

      expect(response).to be_error
      expect(response.structured_content[:errors].pluck(:attribute)).to include('permitted_by')
      expect(permission.reload.permitted_by).not_to eq('verified')
    end

    describe 'demographic_questions' do
      let!(:existing_field) { create(:custom_field) }

      before do
        permission.update!(global_custom_fields: false)
        permission.permissions_custom_fields.create!(custom_field: existing_field, required: true)
      end

      it 'leaves the existing configuration unchanged when omitted' do
        response = run_mcp_tool(described_class, params:, current_user:)

        expect(response).not_to be_error
        expect(permission.reload.global_custom_fields).to be(false)
        expect(permission.permissions_custom_fields.pluck(:custom_field_id)).to eq([existing_field.id])
      end

      it 'resets to the platform defaults when null' do
        response = run_mcp_tool(described_class, params: params.merge(demographic_questions: nil), current_user:)

        expect(response).not_to be_error
        expect(permission.reload.global_custom_fields).to be(true)
        expect(permission.permissions_custom_fields).to be_empty
      end

      it 'asks no questions when empty' do
        response = run_mcp_tool(described_class, params: params.merge(demographic_questions: []), current_user:)

        expect(response).not_to be_error
        expect(permission.reload.global_custom_fields).to be(false)
        expect(permission.permissions_custom_fields).to be_empty
      end

      it 'replaces the rows in array order' do
        field_a, field_b = create_list(:custom_field, 2)
        demographic_questions = [
          { custom_field_id: field_b.id, required: false },
          { custom_field_id: field_a.id }
        ]

        response = run_mcp_tool(described_class, params: params.merge(demographic_questions:), current_user:)

        expect(response).not_to be_error
        rows = permission.reload.permissions_custom_fields.order(:ordering)
        expect(rows.pluck(:custom_field_id)).to eq([field_b.id, field_a.id])
        expect(rows.pluck(:required)).to eq([false, true])
      end

      it 'rolls back the whole update when a custom field is unknown' do
        demographic_questions = [{ custom_field_id: SecureRandom.uuid }]

        response = run_mcp_tool(described_class, params: params.merge(demographic_questions:), current_user:)

        expect(response).to be_error
        expect(permission.reload.permitted_by).not_to eq('admins_moderators')
        expect(permission.permissions_custom_fields.pluck(:custom_field_id)).to eq([existing_field.id])
      end
    end

    context 'with an invalid action' do
      let(:params) do
        {
          phase_id: phase.id,
          action: 'nonexistent_action',
          permitted_by: 'admins_moderators'
        }
      end

      it 'returns the invalid-action error' do
        response = run_mcp_tool(described_class, params:, current_user:)

        expect(response).to be_error
        expect(response.content.first[:text]).to include('does not apply to this phase')
      end
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not update the permission' do
      response = nil
      expect { response = run_mcp_tool(described_class, params:, current_user:) }
        .not_to change { permission.reload.permitted_by }

      expect(response).to be_unauthorized_project
    end
  end

  it 'returns a not-found error when the phase is missing' do
    response = run_mcp_tool(
      described_class,
      params: { phase_id: SecureRandom.uuid, action: 'commenting_idea', permitted_by: 'users' },
      current_user:
    )

    expect(response).to be_not_found('Phase')
  end
end
