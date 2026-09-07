# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetPlatformBranding do
  let(:current_user) { create(:super_admin) }

  def fetch_branding
    run_mcp_tool(described_class, params: {}, current_user:)
  end

  it 'returns the platform branding' do
    config = AppConfiguration.instance
    config.settings['core']['color_main'] = '#163B6D'
    config.style = { 'customFontName' => 'Fira Sans' }
    config.logo = Rails.root.join('spec/fixtures/logo.png').open
    config.save!

    response = fetch_branding

    expect(response).not_to be_error
    expect(response.structured_content).to match(
      organization_name_multiloc: config.settings('core', 'organization_name'),
      locales: config.settings('core', 'locales'),
      colors: {
        main: '#163B6D',
        secondary: config.settings('core', 'color_secondary'),
        text: config.settings('core', 'color_text')
      },
      logo_urls: {
        small: end_with('.png'),
        medium: end_with('.png'),
        large: end_with('.png')
      },
      style: { 'customFontName' => 'Fira Sans' }
    )
  end

  it 'returns nil logo_urls when the platform has no logo' do
    AppConfiguration.instance.remove_logo!

    response = fetch_branding

    expect(response).not_to be_error
    expect(response.structured_content[:logo_urls]).to be_nil
  end
end
