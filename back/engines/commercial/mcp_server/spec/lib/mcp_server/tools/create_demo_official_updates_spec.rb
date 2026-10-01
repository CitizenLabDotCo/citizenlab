# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateDemoOfficialUpdates do
  let(:current_user) { create(:super_admin) }
  let(:idea) { create(:idea, created_at: 10.days.ago) }

  def create_updates(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def update_input(body, **attributes)
    { idea_id: idea.id, body_multiloc: { 'en' => body }, **attributes }
  end

  before { change_lifecycle_stage('demo') }

  it 'creates backdated official updates signed by the platform organization by default' do
    response = create_updates(
      updates: [
        update_input('We are looking into this.'),
        update_input('Approved by the council.', author_multiloc: { 'en' => 'Parks Department' })
      ]
    )

    expect(response).not_to be_error
    updates = idea.reload.official_feedbacks.order(:created_at)
    expect(response.structured_content[:official_feedback_ids]).to match_array(updates.map(&:id))
    expect(idea.official_feedbacks_count).to eq(2)

    updates.each do |update|
      expect(update.user).to eq(current_user)
      expect(update.created_at).to be_between(idea.created_at, Time.zone.now)
      expect(update.updated_at).to eq(update.created_at)
    end

    organization_name = AppConfiguration.instance.settings('core', 'organization_name')
    expect(updates.map(&:author_multiloc)).to contain_exactly(organization_name, { 'en' => 'Parks Department' })
  end

  it 'refuses an input that already has the maximum number of official updates' do
    create_list(:official_feedback, 5, idea: idea)

    response = create_updates(updates: [update_input('One more.')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('already has 5 official updates')
    expect(idea.reload.official_feedbacks_count).to eq(5)
  end

  it 'returns not found for an unknown input' do
    response = create_updates(updates: [update_input('Hello.', idea_id: 'unknown')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Idea not found')
  end

  it 'returns validation errors per update index and creates nothing' do
    response = create_updates(updates: [update_input('Fine.'), update_input('')])

    expect(response).to be_error
    expect(response.structured_content[:errors].sole[:index]).to eq(1)
    expect(OfficialFeedback.count).to eq(0)
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')

    response = create_updates(updates: [update_input('Hello.')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(OfficialFeedback.count).to eq(0)
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(
      described_class,
      params: { updates: [update_input('Hello.')] },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(OfficialFeedback.count).to eq(0)
  end
end
