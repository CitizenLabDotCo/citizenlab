# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateEvent do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:params) do
    {
      project_id: project.id,
      title_multiloc: { 'en' => 'Event 1' },
      start_at: '2026-07-01T10:00:00Z',
      end_at: '2026-07-01T12:00:00Z'
    }
  end

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the event' do
      response = nil
      expect { response = run(params) }.to change { project.reload.events.count }.by(1)

      expect(response).not_to be_error
      expect(response.structured_content).to include(
        id: project.events.sole.id,
        title_multiloc: { 'en' => 'Event 1' },
        start_at: Time.parse('2026-07-01T10:00:00Z'),
        end_at: Time.parse('2026-07-01T12:00:00Z')
      )
    end

    it 'returns structured validation errors for invalid params' do
      response = nil
      expect { response = run(params.merge(maximum_attendees: 0)) }
        .not_to change(Event, :count)

      expect(response).to be_error
      error = response.structured_content[:errors].sole
      expect(error).to include(
        attribute: 'maximum_attendees',
        error: :greater_than,
        message: be_present
      )
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the event' do
      response = run(params)

      expect(response).to be_unauthorized_project
      expect(project.reload.events.count).to eq(0)
    end
  end

  context 'when the project_id does not exist' do
    let(:status) { 'draft' }

    it 'returns a Project not found error' do
      response = run(params.merge(project_id: SecureRandom.uuid))
      expect(response).to be_not_found('Project')
    end
  end
end
