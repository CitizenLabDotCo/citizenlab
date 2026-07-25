# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateResource do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:phase) { create(:volunteering_phase, project: project) }
  let(:cause) { create(:cause, phase: phase) }

  it 'updates a cause image from a remote URL' do
    remote_url = 'https://example.com/cause.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run_mcp_tool(
      described_class,
      params: { type: 'cause', id: cause.id, attributes: { remote_image_url: remote_url } },
      current_user:
    )

    expect(response).not_to be_error
    expect(cause.reload.image.file.read).to eq(fixture_path.binread)
  end

  it 'returns the serialized record with merged multiloc fields' do
    cause.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancienne' })

    response = run_mcp_tool(
      described_class,
      params: { type: 'cause', id: cause.id, attributes: { title_multiloc: { 'en' => 'New' } } },
      current_user:
    )

    expect(response).not_to be_error
    expect(response.structured_content[:id]).to eq(cause.id)
    expect(response.structured_content[:title_multiloc]).to eq('en' => 'New', 'fr-FR' => 'Ancienne')
  end

  it 'updates an event' do
    event = create(:event, project:)

    response = run_mcp_tool(
      described_class,
      params: { type: 'event', id: event.id, attributes: { online_link: 'https://example.com/meet' } },
      current_user:
    )

    expect(response).not_to be_error
    expect(event.reload.online_link).to eq('https://example.com/meet')
    expect(response.structured_content[:id]).to eq(event.id)
  end

  it 'updates a poll question' do
    poll_phase = create(:poll_phase, project:)
    question = create(:poll_question, phase: poll_phase)

    response = run_mcp_tool(
      described_class,
      params: { type: 'poll_question', id: question.id, attributes: { title_multiloc: { 'en' => 'Renamed' } } },
      current_user:
    )

    expect(response).not_to be_error
    expect(question.reload.title_multiloc['en']).to eq('Renamed')
  end

  it 'updates a poll option' do
    poll_phase = create(:poll_phase, project:)
    option = create(:poll_option, question: create(:poll_question, phase: poll_phase))

    response = run_mcp_tool(
      described_class,
      params: { type: 'poll_option', id: option.id, attributes: { title_multiloc: { 'en' => 'Renamed' } } },
      current_user:
    )

    expect(response).not_to be_error
    expect(option.reload.title_multiloc['en']).to eq('Renamed')
  end

  it 'rejects attributes outside the allowlist of the type' do
    option = create(:poll_option, question: create(:poll_question, phase: create(:poll_phase, project:)))

    response = run_mcp_tool(
      described_class,
      params: { type: 'poll_option', id: option.id, attributes: { question_type: 'multiple_options' } },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to include("These fields can't be updated on poll_option: question_type")
  end

  it 'returns structured validation errors for an invalid update' do
    event = create(:event, project:)

    response = run_mcp_tool(
      described_class,
      params: { type: 'event', id: event.id, attributes: { maximum_attendees: 0 } },
      current_user:
    )

    expect(response).to be_error
    expect(response.structured_content[:errors].pluck(:attribute)).to include('maximum_attendees')
  end

  it 'refuses when the project is published' do
    project.admin_publication.update!(publication_status: 'published')

    response = nil
    expect { response = run_mcp_tool(described_class, params: { type: 'cause', id: cause.id, attributes: { title_multiloc: { 'en' => 'New' } } }, current_user:) }
      .not_to change { cause.reload.title_multiloc }

    expect(response).to be_unauthorized_project
  end

  it 'returns a not-found error when the resource is missing' do
    response = run_mcp_tool(
      described_class,
      params: { type: 'event', id: SecureRandom.uuid, attributes: { online_link: 'https://example.com' } },
      current_user:
    )

    expect(response).to be_not_found('Resource (event)')
  end
end
