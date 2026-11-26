# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateProject do
  let(:current_user) { create(:super_admin) }
  let(:params) do
    {
      title_multiloc: { 'en' => 'New project' }
    }
  end

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'creates a draft project' do
    response = nil
    expect { response = run(params) }.to change(Project, :count).by(1)

    expect(response).not_to be_error

    project = Project.find(response.structured_content[:id])
    expect(project.admin_publication.publication_status).to eq('draft')
    expect(response.structured_content).to include(
      title_multiloc: { 'en' => 'New project' },
      admin_url: end_with("/admin/projects/#{project.id}"),
      public_url: end_with("/projects/#{project.slug}")
    )
  end

  describe 'participation location tracking' do
    it 'turns it on when the feature is on' do
      SettingsService.new.activate_feature!('participation_location_tracking')

      response = run(params.merge(track_participation_location: true))

      expect(Project.find(response.structured_content[:id]).track_participation_location).to be true
    end

    it 'ignores the setting while the feature is off, like the web API' do
      SettingsService.new.deactivate_feature!('participation_location_tracking')

      response = run(params.merge(track_participation_location: true))

      expect(response).not_to be_error
      expect(Project.find(response.structured_content[:id]).track_participation_location).to be false
    end
  end

  it 'creates a project visible to specific groups' do
    group = create(:group)

    response = run(params.merge(visible_to: 'groups', group_ids: [group.id]))

    expect(response).not_to be_error
    project = Project.find(response.structured_content[:id])
    expect(project.visible_to).to eq('groups')
    expect(project.groups).to contain_exactly(group)
    expect(response.structured_content).to include(group_ids: [group.id])
  end

  it 'returns structured validation errors for invalid params' do
    response = nil

    expect { response = run(params.merge(visible_to: 'everybody')) }.not_to change(Project, :count)

    expect(response).to be_error
    error = response.structured_content[:errors].sole
    expect(error).to include(
      attribute: 'visible_to',
      error: :inclusion,
      message: be_present
    )
  end

  it 'attaches a remote header_bg by URL' do
    remote_url = 'https://example.com/header.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run(params.merge(remote_header_bg_url: remote_url))

    expect(response).not_to be_error

    project = Project.find(response.structured_content[:id])
    expect(project.header_bg.file.read).to eq(fixture_path.binread)
  end
end
