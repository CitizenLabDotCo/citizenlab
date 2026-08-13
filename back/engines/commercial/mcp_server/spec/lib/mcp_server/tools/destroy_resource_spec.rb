# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::DestroyResource do
  let_it_be(:current_user) { create(:super_admin) }
  let_it_be(:draft_project) { create(:project, :draft) }

  def destroy(resource_type, id)
    run_mcp_tool(described_class, params: { resource_type: resource_type, id: id }, current_user:)
  end

  it 'destroys a project' do
    draft_project = create(:project, :draft)
    response = destroy('project', draft_project.id)
    expect(response).not_to be_error
    expect { draft_project.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a phase' do
    phase = create(:phase, project: draft_project)
    response = destroy('phase', phase.id)
    expect(response).not_to be_error
    expect { phase.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys an event' do
    event = create(:event, project: draft_project)
    response = destroy('event', event.id)
    expect(response).not_to be_error
    expect { event.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a volunteering cause' do
    phase = create(:volunteering_phase, project: draft_project)
    cause = create(:cause, phase: phase)
    response = destroy('cause', cause.id)
    expect(response).not_to be_error
    expect { cause.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a poll question' do
    phase = create(:poll_phase, project: draft_project)
    question = create(:poll_question, phase: phase)
    response = destroy('poll_question', question.id)
    expect(response).not_to be_error
    expect { question.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a poll option' do
    phase = create(:poll_phase, project: draft_project)
    question = create(:poll_question, phase: phase)
    option = create(:poll_option, question: question)
    response = destroy('poll_option', option.id)
    expect(response).not_to be_error
    expect { option.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a project image' do
    image = create(:project_image, project: draft_project)
    response = destroy('project_image', image.id)
    expect(response).not_to be_error
    expect { image.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys an event image' do
    event = create(:event, project: draft_project)
    image = create(:event_image, event: event)
    response = destroy('event_image', image.id)
    expect(response).not_to be_error
    expect { image.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'destroys a file attachment but keeps the file in the project pool' do
    file = create(:file, projects: [draft_project])
    attachment = create(:file_attachment, file: file, attachable: draft_project)
    response = destroy('file_attachment', attachment.id)
    expect(response).not_to be_error
    expect { attachment.reload }.to raise_error(ActiveRecord::RecordNotFound)
    expect(file.reload.projects).to include(draft_project)
  end

  it 'refuses when the target project is published' do
    published_project = create(:project, admin_publication_attributes: { publication_status: 'published' })
    phase = create(:phase, project: published_project)
    response = destroy('phase', phase.id)
    expect(response).to be_unauthorized_project
    expect { phase.reload }.not_to raise_error
  end

  it 'refuses to destroy a project that has inputs' do
    create(:idea_status_proposed)
    phase = create(:native_survey_phase, project: draft_project)
    create(:native_survey_response, project: draft_project, creation_phase: phase)

    response = destroy('project', draft_project.id)
    expect(response).to be_unauthorized(/Cannot destroy project/)
    expect { draft_project.reload }.not_to raise_error
  end

  it 'refuses to destroy a phase whose participation method cascades and has inputs' do
    create(:idea_status_proposed)
    phase = create(:native_survey_phase, project: draft_project)
    create(:native_survey_response, project: draft_project, creation_phase: phase)

    response = destroy('phase', phase.id)
    expect(response).to be_unauthorized(/Cannot destroy phase/)
    expect { phase.reload }.not_to raise_error
  end

  it 'destroys an ideation phase even when it has ideas' do
    create(:idea_status_proposed)
    phase = create(:phase, project: draft_project, participation_method: 'ideation')
    create(:idea, project: draft_project, phases: [phase])

    response = destroy('phase', phase.id)
    expect(response).not_to be_error
    expect { phase.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'returns a not-found error when the record does not exist' do
    response = destroy('phase', SecureRandom.uuid)
    expect(response).to be_not_found('Resource (phase)')
  end
end
