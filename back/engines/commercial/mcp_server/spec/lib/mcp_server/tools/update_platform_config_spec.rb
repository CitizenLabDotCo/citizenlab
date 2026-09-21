# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdatePlatformConfig do
  let(:current_user) { create(:super_admin) }

  def update(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def set_core(attrs)
    config = AppConfiguration.instance
    settings = config.settings
    settings['core'].merge!(attrs)
    config.update!(settings: settings)
  end

  before { change_lifecycle_stage('demo') }

  it 'updates brand colours' do
    response = update(colors: { main: '#112233', text: '#445566' })

    expect(response).not_to be_error
    expect(response.structured_content[:colors]).to include(main: '#112233', text: '#445566')
    expect(AppConfiguration.instance.reload.settings('core', 'color_main')).to eq('#112233')
  end

  it 'merges organization_name per locale' do
    set_core('locales' => %w[en nl-BE], 'organization_name' => { 'en' => 'Old', 'nl-BE' => 'Oud' })

    response = update(organization_name_multiloc: { 'en' => 'New' })

    expect(response).not_to be_error
    expect(response.structured_content[:organization_name_multiloc]).to eq('en' => 'New', 'nl-BE' => 'Oud')
  end

  it 'updates locales and timezone' do
    response = update(locales: %w[en fr-BE], timezone: 'Europe/London')

    expect(response).not_to be_error
    expect(response.structured_content[:locales]).to eq(%w[en fr-BE])
    expect(response.structured_content[:timezone]).to eq('Europe/London')
  end

  it 'sets the logo from a public URL' do
    url = 'https://example.com/logo.png'
    stub_remote_image_download(url)

    response = update(logo_url: url)

    expect(response).not_to be_error
    expect(response.structured_content[:logo_urls]).to be_present
  end

  it 'rejects an invalid hex colour' do
    response = update(colors: { main: 'red' })

    expect(response).to be_error
    expect(AppConfiguration.instance.reload.settings('core', 'color_main')).not_to eq('red')
  end

  it 'refuses an empty update' do
    response = update({})

    expect(response).to be_error
    expect(response.content.first[:text]).to include('at least one field')
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')

    response = update(colors: { main: '#112233' })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(
      described_class,
      params: { colors: { main: '#112233' } },
      current_user: create(:user)
    )

    expect(response).to be_error
  end
end
