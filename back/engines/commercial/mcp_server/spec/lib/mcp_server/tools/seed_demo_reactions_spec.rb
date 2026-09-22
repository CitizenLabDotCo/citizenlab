# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::SeedDemoReactions do
  let(:current_user) { create(:super_admin) }

  def seed(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  before { change_lifecycle_stage('demo') }

  it 'seeds likes from fake demo reactors on inputs and their comments' do
    create(:idea_status_proposed)
    phase = create(:phase, start_at: 20.days.ago, end_at: 10.days.from_now)
    ideas = create_list(:idea, 3, project: phase.project, phases: [phase], created_at: 15.days.ago)
    comment = create(:comment, idea: ideas.first, created_at: 10.days.ago)

    response = seed(phase_id: phase.id, count: 10)

    expect(response).not_to be_error
    reactions = Reaction.all
    expect(reactions.count).to eq(response.structured_content[:reactions_count])
    expect(reactions.map(&:mode)).to all(eq('up'))
    expect(reactions.map(&:user).uniq.size).to eq(10)
    reactions.each do |reaction|
      expect(reaction.user.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
      expect(reaction.created_at).to be_between(reaction.reactable.created_at, Time.zone.now)
    end
    expect(ideas.sum { |idea| idea.reload.likes_count }).to eq(reactions.where(reactable_type: 'Idea').count)
    expect(comment.reload.likes_count).to eq(reactions.where(reactable: comment).count)
  end

  it 'creates dislikes on inputs when the phase allows disliking' do
    create(:idea_status_proposed)
    phase = create(:phase, reacting_dislike_enabled: true)
    create(:idea, project: phase.project, phases: [phase])
    stub_const("#{described_class}::Runner::DISLIKE_PROBABILITY", 1.0)

    response = seed(phase_id: phase.id, count: 3)

    expect(response).not_to be_error
    expect(Reaction.down.count).to eq(3)
  end

  it 'moves proposals that cross their reacting threshold to threshold reached' do
    proposed = create(:idea_status, :proposals, code: 'proposed')
    create(:proposal_status_threshold_reached)
    phase = create(:proposals_phase, reacting_threshold: 2)
    proposal = create(:idea, project: phase.project, phases: [phase], creation_phase: phase, idea_status: proposed)

    response = seed(phase_id: phase.id, count: 5)

    expect(response).not_to be_error
    expect(proposal.reload.idea_status.code).to eq('threshold_reached')
  end

  it 'refuses a phase that does not support reactions' do
    phase = create(:phase, reacting_enabled: false)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('does not support reactions')
    expect(seed(phase_id: create(:single_voting_phase).id, count: 2)).to be_error
  end

  it 'refuses a phase without published inputs' do
    response = seed(phase_id: create(:phase).id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('no published inputs')
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')
    phase = create(:phase)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(Reaction.count).to eq(0)
  end

  it 'refuses when the demo user ceiling is reached' do
    create(:idea_status_proposed)
    phase = create(:phase)
    create(:idea, project: phase.project, phases: [phase])
    stub_const('McpServer::DemoData::MAX_USERS_PER_TENANT', 1)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo user ceiling reached')
  end

  it 'refuses non-admin users' do
    create(:idea_status_proposed)
    phase = create(:phase)
    create(:idea, project: phase.project, phases: [phase])

    response = run_mcp_tool(described_class, params: { phase_id: phase.id, count: 2 }, current_user: create(:user))

    expect(response).to be_error
    expect(Reaction.count).to eq(0)
  end

  it 'returns not found for an unknown phase' do
    response = seed(phase_id: 'unknown', count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Phase not found')
  end
end
