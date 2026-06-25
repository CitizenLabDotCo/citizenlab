# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateProject do
  let(:current_user) { create(:super_admin) }
  let(:params) do
    {
      title_multiloc: { 'en' => 'New project' }
    }
  end

  it 'creates a draft project' do
    response = nil
    expect do
      response = run_mcp_tool(described_class, params:, current_user:)
    end.to change(Project, :count).by(1)

    expect(response).not_to be_error

    project = Project.find(response.structured_content['id'])
    expect(project.admin_publication.publication_status).to eq('draft')
  end

  it 'attaches a remote header_bg by URL' do
    remote_url = 'https://example.com/header.jpg'

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
      params: params.merge(remote_header_bg_url: remote_url),
      current_user:
    )

    expect(response).not_to be_error

    project = Project.find(response.structured_content['id'])
    expected_bytes = Rails.root.join('spec/fixtures/female_avatar_0.jpg').binread
    expect(project.header_bg.file.read).to eq(expected_bytes)
  end
end
