# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateResource do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:phase) { create(:volunteering_phase, project: project) }
  let(:cause) { create(:cause, phase: phase) }

  it 'updates a cause image from a remote URL' do
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
      params: { type: 'cause', id: cause.id, attributes: { remote_image_url: remote_url } },
      current_user:
    )

    expect(response).not_to be_error
    expected_bytes = Rails.root.join('spec/fixtures/female_avatar_0.jpg').binread
    expect(cause.reload.image.file.read).to eq(expected_bytes)
  end
end
