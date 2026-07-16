# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateProject do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  describe '#input_schema' do
    it "reuses create_project's schema without folder_id" do
      create_properties = McpServer::Tools::CreateProject.new.input_schema[:properties].except(:folder_id)
      schema = described_class.new.input_schema

      expect(schema[:properties].keys).to eq([:project_id, *create_properties.keys])
      expect(schema[:required]).to eq(%w[project_id])
      expect(schema[:additionalProperties]).to be(false)
    end
  end

  it 'updates the header background from a remote URL' do
    remote_url = 'https://example.com/header.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run(project_id: project.id, remote_header_bg_url: remote_url)

    expect(response).not_to be_error
    expect(project.reload.header_bg.file.read).to eq(fixture_path.binread)
  end

  it 'removes the header background when remote_header_bg_url is null' do
    stub_remote_image_download('https://example.com/header.jpg')
    project.update!(remote_header_bg_url: 'https://example.com/header.jpg')

    response = nil
    expect { response = run(project_id: project.id, remote_header_bg_url: nil) }
      .to change { project.reload.header_bg.file }.to(nil)

    expect(response).not_to be_error
  end

  it 'replaces associations wholesale when their ids are given, and preserves them otherwise' do
    area_a, area_b, area_c = create_list(:area, 3)
    project.update!(areas: [area_a, area_b])

    response = run(project_id: project.id, title_multiloc: { 'en' => 'Renamed' })
    expect(response).not_to be_error
    expect(project.reload.areas).to contain_exactly(area_a, area_b)

    response = run(project_id: project.id, area_ids: [area_c.id])
    expect(response).not_to be_error
    expect(project.reload.areas).to contain_exactly(area_c)
  end

  it 'replaces the visibility groups' do
    group_a, group_b = create_list(:group, 2)
    project.update!(visible_to: 'groups', groups: [group_a])

    response = run(project_id: project.id, group_ids: [group_b.id])

    expect(response).not_to be_error
    expect(project.reload.groups).to contain_exactly(group_b)
    expect(response.structured_content).to include(group_ids: [group_b.id])
  end

  it 'updates only the given attributes' do
    response = nil
    expect { response = run(project_id: project.id, listed: false) }
      .to change { project.reload.listed }.to(false)
      .and not_change { project.reload.title_multiloc }

    expect(response).not_to be_error
  end

  it 'returns the serialized project with merged multiloc fields' do
    project.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

    response = run(project_id: project.id, title_multiloc: { 'en' => 'New' })

    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: project.id,
      title_multiloc: { 'en' => 'New', 'fr-FR' => 'Ancien' }
    )
  end

  it 'returns structured validation errors for an invalid update' do
    response = nil
    expect { response = run(project_id: project.id, visible_to: 'everybody') }
      .not_to change { project.reload.visible_to }

    expect(response).to be_error

    error = response.structured_content[:errors].sole
    expect(error).to include(
      attribute: 'visible_to',
      error: :inclusion,
      message: be_present
    )
  end

  it 'refuses when the project is published' do
    published = create(:project) # Projects are published by default.

    response = nil
    expect { response = run(project_id: published.id, title_multiloc: { 'en' => 'New' }) }
      .not_to change { published.reload.title_multiloc }

    expect(response).to be_unauthorized_project
  end

  it 'returns a not-found error when the project is missing' do
    response = run(project_id: SecureRandom.uuid, title_multiloc: { 'en' => 'New' })

    expect(response).to be_not_found('Project')
  end
end
