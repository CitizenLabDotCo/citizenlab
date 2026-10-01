# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListInputs do
  let_it_be(:current_user) { create(:super_admin) }

  def list(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists the published inputs of a phase, newest first, in a lean row shape' do
    phase = create(:phase)
    old_idea = create(:idea, project: phase.project, phases: [phase], published_at: 2.days.ago, created_at: 2.days.ago)
    new_idea = create(:idea, project: phase.project, phases: [phase])
    create(:idea, project: phase.project, phases: [phase], publication_status: 'draft')
    create(:idea) # other project

    response = list(phase_id: phase.id)

    expect(response).not_to be_error
    rows = response.structured_content[:data]
    expect(rows.pluck(:id)).to eq [new_idea.id, old_idea.id]
    expect(rows.first).to match(
      id: new_idea.id,
      title_multiloc: new_idea.title_multiloc,
      author_name: new_idea.author.full_name,
      idea_status_code: new_idea.idea_status.code,
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      budget: new_idea.budget,
      published_at: be_present,
      public_url: be_present
    )
    expect(rows.first).not_to have_key(:body_multiloc)
  end

  it 'searches by title' do
    phase = create(:phase)
    match = create(:idea, project: phase.project, phases: [phase], title_multiloc: { 'en' => 'Bike lanes now' })
    create(:idea, project: phase.project, phases: [phase], title_multiloc: { 'en' => 'More trees' })

    response = list(phase_id: phase.id, search: 'bike lanes')

    expect(response.structured_content[:data].pluck(:id)).to eq [match.id]
  end

  it 'paginates' do
    phase = create(:phase)
    create_list(:idea, 3, project: phase.project, phases: [phase])

    response = list(phase_id: phase.id, per_page: 2, page: 2)

    expect(response.structured_content[:data].size).to eq(1)
    expect(response.structured_content.dig(:pagination, :total_count)).to eq(3)
  end

  it 'returns not found for an unknown phase' do
    response = list(phase_id: 'unknown')

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Phase not found')
  end
end
