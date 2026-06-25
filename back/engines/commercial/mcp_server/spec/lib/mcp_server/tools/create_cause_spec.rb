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

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the cause' do
      response = nil
      expect do
        response = run_mcp_tool(described_class, params:, current_user:)
      end.to change { phase.reload.causes.count }.by(1)

      expect(response).not_to be_error
    end

    it 'attaches a remote image by URL' do
      remote_url = 'https://example.com/cause.jpg'

      # Bypass SsrfFilter so WebMock can intercept via Net::HTTP. The codebase prepends
      # ProcessableUriDownloader (see back/config/initializers/carrierwave.rb), so we stub
      # on that module rather than on the base class.
      allow_any_instance_of(ProcessableUriDownloader)
        .to receive(:skip_ssrf_protection?).and_return(true)

      stub_request(:any, remote_url).to_return(
        status: 200,
        body: ->(_req) { Rails.root.join('spec/fixtures/female_avatar_0.jpg').open },
        headers: { 'Content-Type' => 'image/jpeg' }
      )

      response = run_mcp_tool(
        described_class,
        params: params.merge(remote_image_url: remote_url),
        current_user:
      )

      expect(response).not_to be_error
      cause = Volunteering::Cause.find(response.structured_content[:id])
      expected_bytes = Rails.root.join('spec/fixtures/female_avatar_0.jpg').binread
      expect(cause.image.file.read).to eq(expected_bytes)
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the cause' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(phase.reload.causes.count).to eq(0)
    end
  end
end
