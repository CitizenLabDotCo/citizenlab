# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::SeedDemoAttendees do
  let(:current_user) { create(:super_admin) }

  def seed(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  before { change_lifecycle_stage('demo') }

  it 'registers fake demo attendees for an event, backdated before its start' do
    event = create(:event, start_at: 5.days.from_now, end_at: 6.days.from_now)

    response = seed(event_id: event.id, count: 5)

    expect(response).not_to be_error
    expect(response.structured_content[:attendances_count]).to eq(5)
    attendances = event.reload.attendances
    expect(attendances.size).to eq(5)
    expect(event.attendees_count).to eq(5)
    attendances.each do |attendance|
      expect(attendance.attendee.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
      expect(attendance.created_at).to be_between(event.created_at, event.start_at)
      expect(attendance.created_at).to be <= Time.zone.now
    end
  end

  it 'spreads attendees over the events of a project' do
    project = create(:project)
    events = create_list(:event, 2, project: project)

    response = seed(project_id: project.id, count: 20)

    expect(response).not_to be_error
    expect(events.sum { |event| event.reload.attendees_count }).to eq(20)
    expect(events.map(&:attendees_count)).to all(be_positive)
  end

  it 'skips full events when spreading over a project' do
    project = create(:project)
    small = create(:event, project: project, maximum_attendees: 1)
    create(:event, project: project)

    response = seed(project_id: project.id, count: 10)

    expect(response).not_to be_error
    expect(small.reload.attendees_count).to be <= 1
  end

  it 'fails with the model message when the event cannot fit the attendees' do
    event = create(:event, maximum_attendees: 2)

    response = seed(event_id: event.id, count: 5)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Maximum number of attendees')
    expect(Events::Attendance.count).to eq(0)
    expect(McpServer::DemoData.demo_users.count).to eq(0)
  end

  it 'requires exactly one of event_id and project_id' do
    event = create(:event)

    expect(seed(count: 2)).to be_error
    response = seed(event_id: event.id, project_id: event.project_id, count: 2)
    expect(response).to be_error
    expect(response.content.first[:text]).to include('exactly one')
  end

  it 'returns not found for unknown ids and errors on a project without events' do
    expect(seed(event_id: 'unknown', count: 2).content.first[:text]).to include('Event not found')
    expect(seed(project_id: 'unknown', count: 2).content.first[:text]).to include('Project not found')
    expect(seed(project_id: create(:project).id, count: 2).content.first[:text]).to include('no events')
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')
    event = create(:event)

    response = seed(event_id: event.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(Events::Attendance.count).to eq(0)
  end

  it 'refuses when the demo user ceiling is reached' do
    event = create(:event)
    stub_const('McpServer::DemoData::MAX_USERS_PER_TENANT', 1)

    response = seed(event_id: event.id, count: 2)

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo user ceiling reached')
  end

  it 'refuses non-admin users' do
    event = create(:event)

    response = run_mcp_tool(described_class, params: { event_id: event.id, count: 2 }, current_user: create(:user))

    expect(response).to be_error
    expect(Events::Attendance.count).to eq(0)
  end
end
