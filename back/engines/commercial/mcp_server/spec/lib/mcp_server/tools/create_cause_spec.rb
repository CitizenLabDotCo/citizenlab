# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateCause do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:volunteering_phase, project: project) }
  let(:params) do
    {
      phase_id: phase.id,
      title_multiloc: { 'en' => 'Cause 1' }
    }
  end

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the cause' do
      response = nil
      expect { response = run(params) }
        .to change { phase.reload.causes.count }.by(1)

      expect(response).not_to be_error
      expect(response.structured_content).to include(
        id: phase.causes.sole.id,
        title_multiloc: { 'en' => 'Cause 1' }
      )
    end

    it 'returns structured validation errors for invalid params' do
      response = nil
      expect { response = run(params.merge(title_multiloc: {})) }
        .not_to change(Volunteering::Cause, :count)

      expect(response).to be_error
      expect(response.structured_content[:errors]).to include(
        a_hash_including(attribute: 'title_multiloc', error: :blank, message: be_present)
      )
    end

    it 'returns a not-found error when the phase is missing' do
      response = run(params.merge(phase_id: SecureRandom.uuid))
      expect(response).to be_not_found('Phase')
    end

    it 'attaches a remote image by URL' do
      remote_url = 'https://example.com/cause.jpg'
      fixture_path = stub_remote_image_download(remote_url)

      response = run(params.merge(remote_image_url: remote_url))

      expect(response).not_to be_error
      cause = Volunteering::Cause.find(response.structured_content[:id])
      expect(cause.image.file.read).to eq(fixture_path.binread)
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the cause' do
      response = run(params)

      expect(response).to be_unauthorized_project
      expect(phase.reload.causes.count).to eq(0)
    end
  end
end
