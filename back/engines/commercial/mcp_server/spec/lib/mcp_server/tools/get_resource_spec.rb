# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetResource do
  let_it_be(:current_user) { create(:super_admin) }

  def get(type, id)
    run_mcp_tool(described_class, params: { type:, id: }, current_user:)
  end

  it 'gets a project' do
    project = create(:project)
    response = get('project', project.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: project.id,
      title_multiloc: project.title_multiloc,
      admin_url: be_present
    )
  end

  it 'gets a phase' do
    phase = create(:phase)
    response = get('phase', phase.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: phase.id,
      title_multiloc: phase.title_multiloc,
      admin_url: be_present
    )
  end

  it 'gets an event' do
    event = create(:event)
    response = get('event', event.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: event.id,
      title_multiloc: event.title_multiloc
    )
  end

  it 'gets a folder' do
    folder = create(:project_folder)
    response = get('folder', folder.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: folder.id,
      title_multiloc: folder.title_multiloc
    )
  end

  it 'gets an area' do
    area = create(:area)
    response = get('area', area.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: area.id,
      title_multiloc: area.title_multiloc
    )
  end

  it 'gets a global topic' do
    topic = create(:global_topic)
    response = get('global_topic', topic.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: topic.id,
      title_multiloc: topic.title_multiloc
    )
  end

  it 'gets a volunteering cause' do
    cause = create(:cause)
    response = get('cause', cause.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: cause.id,
      title_multiloc: cause.title_multiloc
    )
  end

  it 'gets a poll question with its options inlined' do
    question = create(:poll_question)
    option = create(:poll_option, question:)

    response = get('poll_question', question.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: question.id,
      title_multiloc: question.title_multiloc,
      options: [a_hash_including(id: option.id)]
    )
  end

  it 'gets a poll option' do
    option = create(:poll_option)
    response = get('poll_option', option.id)
    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: option.id,
      title_multiloc: option.title_multiloc
    )
  end

  it 'returns a not-found error when the record does not exist' do
    response = get('phase', SecureRandom.uuid)
    expect(response).to be_not_found('Resource (phase)')
  end
end
