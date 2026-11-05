# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateDemoInput do
  let(:current_user) { create(:super_admin) }

  def update(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  before { change_lifecycle_stage('demo') }

  it 'updates title and body, merging multiloc per locale' do
    create(:idea_status_proposed)
    idea = create(:idea, title_multiloc: { 'en' => 'Old', 'nl-BE' => 'Oud' }, body_multiloc: { 'en' => '<p>Old</p>' })

    response = update(idea_id: idea.id, title_multiloc: { 'en' => 'New title' }, body_multiloc: { 'en' => '<p>New body</p>' })

    expect(response).not_to be_error
    idea.reload
    expect(idea.title_multiloc).to eq('en' => 'New title', 'nl-BE' => 'Oud')
    expect(idea.body_multiloc).to eq('en' => '<p>New body</p>')
    expect(response.structured_content[:id]).to eq(idea.id)
  end

  it 'changes the status' do
    create(:idea_status_proposed)
    accepted = create(:idea_status, code: 'accepted', participation_method: 'ideation')
    idea = create(:idea)

    response = update(idea_id: idea.id, status: 'accepted')

    expect(response).not_to be_error
    expect(idea.reload.idea_status).to eq(accepted)
  end

  it 'refuses a status not available for the input' do
    proposed = create(:idea_status_proposed)
    idea = create(:idea, idea_status: proposed)

    response = update(idea_id: idea.id, status: 'answered')

    expect(response).to be_error
    expect(response.content.first[:text]).to include("'answered' is not available", 'proposed')
    expect(idea.reload.idea_status.code).to eq('proposed')
  end

  it 'refuses a published survey response (not editable after submission)' do
    create(:idea_status_proposed)
    phase = create(:native_survey_phase)
    response_idea = create(:idea, project: phase.project, creation_phase: phase, phases: [phase])

    response = update(idea_id: response_idea.id, body_multiloc: { 'en' => '<p>Changed</p>' })

    expect(response).to be_error
  end

  it 'returns not found for an unknown input' do
    response = update(idea_id: 'unknown', title_multiloc: { 'en' => 'X' })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Input not found')
  end

  it 'refuses on platforms that are not demo or trial' do
    create(:idea_status_proposed)
    idea = create(:idea, title_multiloc: { 'en' => 'Original' })
    change_lifecycle_stage('active')

    response = update(idea_id: idea.id, title_multiloc: { 'en' => 'Changed' })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(idea.reload.title_multiloc).to eq('en' => 'Original')
  end

  it 'refuses non-admin users' do
    create(:idea_status_proposed)
    idea = create(:idea, title_multiloc: { 'en' => 'Original' })

    response = run_mcp_tool(
      described_class,
      params: { idea_id: idea.id, title_multiloc: { 'en' => 'Changed' } },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(idea.reload.title_multiloc).to eq('en' => 'Original')
  end
end
