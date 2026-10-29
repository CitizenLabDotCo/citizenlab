# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::SetPublicationStatus do
  let(:current_user) { create(:super_admin) }

  before { change_lifecycle_stage('demo') }

  def set_status(resource_type, resource_id, publication_status)
    run_mcp_tool(
      described_class,
      params: { resource_type:, resource_id:, publication_status: },
      current_user:
    )
  end

  it 'publishes a draft project' do
    project = create(:project, :draft)

    response = set_status('project', project.id, 'published')

    expect(response).not_to be_error
    expect(project.admin_publication.reload.publication_status).to eq('published')
    expect(response.structured_content[:id]).to eq(project.id)
  end

  it 'unpublishes a published project back to draft' do
    project = create(:project, admin_publication_attributes: { publication_status: 'published' })

    response = set_status('project', project.id, 'draft')

    expect(response).not_to be_error
    expect(project.admin_publication.reload.publication_status).to eq('draft')
  end

  it 'publishes a draft folder' do
    folder = create(:project_folder, admin_publication_attributes: { publication_status: 'draft' })

    response = set_status('folder', folder.id, 'published')

    expect(response).not_to be_error
    expect(folder.admin_publication.reload.publication_status).to eq('published')
  end

  it 'unpublishes a published folder back to draft' do
    folder = create(:project_folder)

    response = set_status('folder', folder.id, 'draft')

    expect(response).not_to be_error
    expect(folder.admin_publication.reload.publication_status).to eq('draft')
  end

  it 'logs the publication change' do
    project = create(:project, :draft)

    expect { set_status('project', project.id, 'published') }
      .to have_enqueued_job(LogActivityJob).at_least(:once)
  end

  it 'reports an already-matching status without re-running the update side effects' do
    project = create(:project, :draft)

    response = nil
    expect { response = set_status('project', project.id, 'draft') }
      .not_to have_enqueued_job(LogActivityJob)
    expect(response).not_to be_error
    expect(response.content.sole[:text]).to include('already draft')
  end

  it 'refuses outside demo and trial platforms' do
    change_lifecycle_stage('active')
    project = create(:project, :draft)

    response = set_status('project', project.id, 'published')

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('demo and trial')
    expect(project.admin_publication.reload.publication_status).to eq('draft')
  end

  it 'refuses non-admin users' do
    project = create(:project, :draft)

    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'project', resource_id: project.id, publication_status: 'published' },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(project.admin_publication.reload.publication_status).to eq('draft')
  end

  context 'as a project moderator' do
    let(:project) { create(:project, :draft) }
    let(:current_user) { create(:project_moderator, projects: [project]) }

    it 'refuses to publish a never-published project whose review is not approved' do
      review = create(:project_review, project:)

      response = set_status('project', project.id, 'published')

      expect(response).to be_error
      expect(response.content.sole[:text]).to include('approved review')
      expect(project.admin_publication.reload.publication_status).to eq('draft')
      expect(review.reload).not_to be_approved
    end

    it 'publishes a project whose review is approved' do
      create(:project_review, :approved, project:)

      response = set_status('project', project.id, 'published')

      expect(response).not_to be_error
      expect(project.admin_publication.reload.publication_status).to eq('published')
    end
  end

  it 'returns a not-found error for a missing resource' do
    response = set_status('project', SecureRandom.uuid, 'published')

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('Resource (project) not found')
  end
end
