# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::SeedDemoVotes do
  let(:current_user) { create(:super_admin) }

  def seed(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def create_ideas(phase, budgets)
    budgets.map { |budget| create(:idea, project: phase.project, phases: [phase], budget: budget) }
  end

  before { change_lifecycle_stage('demo') }

  it 'seeds a budgeting phase with valid submitted baskets from fake demo voters' do
    phase = create(
      :budgeting_phase,
      start_at: 20.days.ago, end_at: 10.days.from_now, voting_min_total: 300, voting_max_total: 1000
    )
    ideas = create_ideas(phase, [500, 400, 300])

    response = seed(phase_id: phase.id, count: 4)

    expect(response).not_to be_error
    baskets = phase.reload.baskets
    expect(response.structured_content[:basket_ids]).to match_array(baskets.map(&:id))
    expect(baskets.size).to eq(4)

    baskets.each do |basket|
      expect(basket).to be_submitted
      expect(basket.user.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
      expect(basket.total_votes).to be_between(300, 1000)
      basket.baskets_ideas.each { |pick| expect(pick.votes).to eq(pick.idea.budget) }
      expect(basket.created_at).to be_between(phase.start_at.in_time_zone, Time.zone.now)
      expect(basket.submitted_at).to eq(basket.created_at)
    end

    expect(phase.baskets_count).to eq(4)
    expect(ideas.sum { |idea| idea.reload.votes_count }).to eq(baskets.sum(&:total_votes))
  end

  it 'seeds a single voting phase with one vote per pick, within the vote limit' do
    phase = create(:single_voting_phase, start_at: 10.days.ago, end_at: 5.days.from_now, voting_max_total: 2)
    create_ideas(phase, [nil, nil, nil])

    response = seed(phase_id: phase.id, count: 3)

    expect(response).not_to be_error
    phase.reload.baskets.each do |basket|
      expect(basket.baskets_ideas.size).to be_between(1, 2)
      expect(basket.baskets_ideas.map(&:votes)).to all(eq(1))
    end
  end

  it 'seeds a multiple voting phase within the per-idea and total limits' do
    phase = create(
      :single_voting_phase,
      voting_method: 'multiple_voting',
      start_at: 10.days.ago, end_at: 5.days.from_now,
      voting_max_total: 10, voting_max_votes_per_idea: 3
    )
    create_ideas(phase, [nil, nil, nil])

    response = seed(phase_id: phase.id, count: 3)

    expect(response).not_to be_error
    phase.reload.baskets.each do |basket|
      expect(basket.baskets_ideas.map(&:votes)).to all(be_between(1, 3))
      expect(basket.total_votes).to be <= 10
    end
  end

  it 'fails with the submission validation message when the limits cannot be met' do
    phase = create(:budgeting_phase, voting_min_total: 5000, voting_max_total: 6000)
    create_ideas(phase, [200])

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.structured_content[:errors].pluck(:attribute)).to include('total_votes')
    expect(Basket.count).to eq(0)
    expect(McpServer::DemoData.demo_users.count).to eq(0)
  end

  it 'refuses a phase that is not a voting phase' do
    phase = create(:phase)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('not a voting phase')
  end

  it 'refuses a voting phase without votable inputs' do
    phase = create(:budgeting_phase)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('no published inputs')
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')
    phase = create(:budgeting_phase)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(Basket.count).to eq(0)
  end

  it 'refuses when the demo user ceiling is reached' do
    phase = create(:budgeting_phase)
    create_ideas(phase, [500])
    stub_const('McpServer::DemoData::MAX_USERS_PER_TENANT', 1)

    response = seed(phase_id: phase.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo user ceiling reached')
  end

  it 'refuses non-admin users' do
    phase = create(:budgeting_phase)
    create_ideas(phase, [500])

    response = run_mcp_tool(described_class, params: { phase_id: phase.id, count: 2 }, current_user: create(:user))

    expect(response).to be_error
    expect(Basket.count).to eq(0)
  end
end
