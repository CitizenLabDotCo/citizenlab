# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateDemoInputs do
  let(:current_user) { create(:super_admin) }

  def create_inputs(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def idea_input(title)
    {
      title_multiloc: { 'en' => title },
      body_multiloc: { 'en' => "<p>#{title}</p>" }
    }
  end

  before { change_lifecycle_stage('demo') }

  it 'creates ideation ideas with fake demo authors and backdated timestamps' do
    create(:idea_status_proposed)
    phase = create(:phase, start_at: 20.days.ago, end_at: 10.days.from_now)

    response = create_inputs(
      phase_id: phase.id,
      inputs: [
        idea_input('Bike lanes').merge(location: { lat: 50.85, lng: 4.35, description: 'Grand Place' }),
        idea_input('More trees').merge(budget: 2500)
      ]
    )

    expect(response).not_to be_error
    ideas = phase.reload.ideas
    expect(response.structured_content[:idea_ids]).to match_array(ideas.map(&:id))

    ideas.each do |idea|
      expect(idea).to be_published
      expect(idea.author.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
      expect(idea.author.password_digest).to be_nil
      expect(idea.created_at).to be_between(phase.start_at.in_time_zone, Time.zone.now)
      expect(idea.published_at).to eq(idea.created_at)
      expect(idea.creation_phase).to be_nil
      expect(idea.idea_status.code).to eq('proposed')
    end

    bike_lanes = ideas.find { |idea| idea.title_multiloc['en'] == 'Bike lanes' }
    expect(bike_lanes.location_description).to eq('Grand Place')
    expect(bike_lanes.location_point.coordinates).to eq([4.35, 50.85])
    more_trees = ideas.find { |idea| idea.title_multiloc['en'] == 'More trees' }
    expect(more_trees.budget).to eq(2500)
  end

  it 'creates native survey responses' do
    create(:idea_status_proposed)
    phase = create(:native_survey_phase, start_at: 10.days.ago, end_at: 5.days.from_now)
    form = create(:custom_form, participation_context: phase)
    field = create(:custom_field, resource: form)

    response = create_inputs(
      phase_id: phase.id,
      inputs: [{ custom_field_values: { field.key => 'An answer' } }]
    )

    expect(response).not_to be_error
    survey_response = phase.reload.ideas.sole
    expect(survey_response.creation_phase).to eq(phase)
    expect(survey_response.custom_field_values).to eq(field.key => 'An answer')
    expect(survey_response.author.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
  end

  it 'keeps backdated proposals within the expiry window' do
    create(:idea_status, :proposals, code: 'proposed')
    phase = create(:proposals_phase, start_at: 200.days.ago, end_at: 5.days.from_now, expire_days_limit: 30)

    response = create_inputs(phase_id: phase.id, inputs: [idea_input('Car-free Sundays')])

    expect(response).not_to be_error
    proposal = phase.reload.ideas.sole
    expect(proposal.creation_phase).to eq(phase)
    expect(proposal.created_at).to be > 30.days.ago
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')
    phase = create(:phase)

    response = create_inputs(phase_id: phase.id, inputs: [idea_input('Bike lanes')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(Idea.count).to eq(0)
  end

  it 'returns validation errors per input index and creates nothing' do
    create(:idea_status_proposed)
    phase = create(:phase)

    response = create_inputs(
      phase_id: phase.id,
      inputs: [idea_input('Bike lanes'), { body_multiloc: { 'en' => '<p>No title</p>' } }]
    )

    expect(response).to be_error
    errors = response.structured_content[:errors]
    expect(errors.sole[:index]).to eq(1)
    expect(errors.sole[:errors].pluck(:attribute)).to include('title_multiloc')
    expect(Idea.count).to eq(0)
    expect(McpServer::DemoData.demo_users.count).to eq(0)
  end

  it 'refuses when the project demo input ceiling is reached' do
    create(:idea_status_proposed)
    phase = create(:phase)
    stub_const('McpServer::DemoData::MAX_INPUTS_PER_PROJECT', 1)

    response = create_inputs(phase_id: phase.id, inputs: [idea_input('One'), idea_input('Two')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo input ceiling reached')
    expect(Idea.count).to eq(0)
  end

  it 'refuses when the platform demo user ceiling is reached' do
    phase = create(:phase)
    stub_const('McpServer::DemoData::MAX_USERS_PER_TENANT', 1)

    response = create_inputs(phase_id: phase.id, inputs: [idea_input('One'), idea_input('Two')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo user ceiling reached')
  end

  it 'refuses non-admin users' do
    create(:idea_status_proposed)
    phase = create(:phase)

    response = run_mcp_tool(
      described_class,
      params: { phase_id: phase.id, inputs: [idea_input('Bike lanes')] },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(Idea.count).to eq(0)
  end

  it 'returns not found for an unknown phase' do
    response = create_inputs(phase_id: 'unknown', inputs: [idea_input('Bike lanes')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Phase not found')
  end
end
