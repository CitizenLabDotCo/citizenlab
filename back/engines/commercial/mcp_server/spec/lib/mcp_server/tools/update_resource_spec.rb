# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateResource do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:phase) { create(:volunteering_phase, project: project) }
  let(:cause) { create(:cause, phase: phase) }

  it 'updates a cause image from a remote URL' do
    remote_url = 'https://example.com/cause.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run_mcp_tool(
      described_class,
      params: { type: 'cause', id: cause.id, attributes: { remote_image_url: remote_url } },
      current_user:
    )

    expect(response).not_to be_error
    expect(cause.reload.image.file.read).to eq(fixture_path.binread)
  end
end
