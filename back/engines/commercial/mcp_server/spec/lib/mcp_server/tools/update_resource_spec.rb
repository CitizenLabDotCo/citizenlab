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

  it 'returns the serialized record with merged multiloc fields' do
    cause.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancienne' })

    response = run_mcp_tool(
      described_class,
      params: { type: 'cause', id: cause.id, attributes: { title_multiloc: { 'en' => 'New' } } },
      current_user:
    )

    expect(response).not_to be_error
    expect(response.structured_content[:id]).to eq(cause.id)
    expect(response.structured_content[:title_multiloc]).to eq('en' => 'New', 'fr-FR' => 'Ancienne')
  end
end
