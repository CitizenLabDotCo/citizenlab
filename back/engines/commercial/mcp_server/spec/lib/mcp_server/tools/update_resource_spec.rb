# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateResource do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:phase) { create(:volunteering_phase, project: project) }
  let(:cause) { create(:cause, phase: phase) }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'updates a cause image from a remote URL' do
    remote_url = 'https://example.com/cause.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run(type: 'cause', id: cause.id, attributes: { remote_image_url: remote_url })

    expect(response).not_to be_error
    expect(cause.reload.image.file.read).to eq(fixture_path.binread)
  end

  it 'returns the serialized record with merged multiloc fields' do
    cause.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancienne' })

    response = run(type: 'cause', id: cause.id, attributes: { title_multiloc: { 'en' => 'New' } })

    expect(response).not_to be_error
    expect(response.structured_content).to include(
      id: cause.id,
      title_multiloc: { 'en' => 'New', 'fr-FR' => 'Ancienne' }
    )
  end

  it 'updates an event' do
    event = create(:event, project:)

    response = run(type: 'event', id: event.id, attributes: { online_link: 'https://example.com/meet' })

    expect(response).not_to be_error
    expect(event.reload.online_link).to eq('https://example.com/meet')
    expect(response.structured_content[:id]).to eq(event.id)
  end

  it 'updates a poll question' do
    poll_phase = create(:poll_phase, project:)
    question = create(:poll_question, phase: poll_phase)

    response = run(type: 'poll_question', id: question.id, attributes: { title_multiloc: { 'en' => 'Renamed' } })

    expect(response).not_to be_error
    expect(question.reload.title_multiloc['en']).to eq('Renamed')
  end

  it 'updates a poll option' do
    poll_phase = create(:poll_phase, project:)
    option = create(:poll_option, question: create(:poll_question, phase: poll_phase))

    response = run(type: 'poll_option', id: option.id, attributes: { title_multiloc: { 'en' => 'Renamed' } })

    expect(response).not_to be_error
    expect(option.reload.title_multiloc['en']).to eq('Renamed')
  end

  it 'rejects attributes outside the allowlist of the type' do
    option = create(:poll_option, question: create(:poll_question, phase: create(:poll_phase, project:)))

    response = run(type: 'poll_option', id: option.id, attributes: { question_type: 'multiple_options' })

    expect(response).to be_error
    expect(response.content.sole[:text]).to include("These fields can't be updated on poll_option: question_type")
  end

  it 'returns structured validation errors for an invalid update' do
    event = create(:event, project:)

    response = nil
    expect { response = run(type: 'event', id: event.id, attributes: { maximum_attendees: 0 }) }
      .not_to change { event.reload.maximum_attendees }

    expect(response).to be_error

    error = response.structured_content[:errors].sole
    expect(error).to include(
      attribute: 'maximum_attendees',
      error: :greater_than,
      message: be_present
    )
  end

  it 'refuses when the project is published' do
    project.admin_publication.update!(publication_status: 'published')

    response = nil
    expect { response = run(type: 'cause', id: cause.id, attributes: { title_multiloc: { 'en' => 'New' } }) }
      .not_to change { cause.reload.title_multiloc }

    expect(response).to be_unauthorized_project
  end

  it 'returns a not-found error when the resource is missing' do
    response = run(type: 'event', id: SecureRandom.uuid, attributes: { online_link: 'https://example.com' })

    expect(response).to be_not_found('Resource (event)')
  end
end
