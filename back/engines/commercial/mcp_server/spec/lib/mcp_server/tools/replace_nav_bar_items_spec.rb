# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ReplaceNavBarItems do
  let(:current_user) { create(:super_admin) }

  before { change_lifecycle_stage('demo') }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def home = { code: 'home' }

  it 'rebuilds the navbar in array order, removing items not in the payload' do
    create(:nav_bar_item, code: 'home', static_page: nil)
    removed_item = create(:nav_bar_item)
    page = create(:static_page)
    folder = create(:project_folder)
    project = create(:project)

    response = run(items: [
      home,
      { code: 'projects' },
      {
        title_multiloc: { 'en' => 'Departments' },
        children: [{ project_folder_id: folder.id }, { project_id: project.id }]
      },
      { static_page_id: page.id, title_multiloc: { 'en' => 'About' } }
    ])

    expect(response).not_to be_error
    expect { removed_item.reload }.to raise_error(ActiveRecord::RecordNotFound)

    items = NavBarItem.top_level.order(:ordering)
    expect(items.map(&:code)).to eq %w[home projects custom custom]
    expect(items.map(&:ordering)).to eq [0, 1, 2, 3]

    dropdown = items.third
    expect(dropdown).to be_dropdown
    expect(dropdown.children.map(&:project_folder_id)).to eq [folder.id, nil]
    expect(dropdown.children.map(&:project_id)).to eq [nil, project.id]

    expect(response.structured_content[:items].map { |item| item[:code] }).to eq %w[home projects custom custom]
  end

  it 'round-trips the output of get_nav_bar_items' do
    create(:nav_bar_item, code: 'home', static_page: nil, title_multiloc: nil)
    dropdown = create(:nav_bar_item, :dropdown)
    # Titles fall back to the target's, so targets stick to active locales too:
    # inactive locales in a fetched multiloc would be refused on the way back in.
    child_page = create(:static_page, title_multiloc: { 'en' => 'Child page' })
    create(:nav_bar_item, parent: dropdown, static_page: child_page, title_multiloc: nil)
    create(:nav_bar_item, static_page: create(:static_page, title_multiloc: { 'en' => 'About page' }), title_multiloc: { 'en' => 'About' })

    fetched = run_mcp_tool(McpServer::Tools::GetNavBarItems, params: {}, current_user:).structured_content

    response = run(items: fetched[:items], nav_last_updated_at: fetched[:nav_last_updated_at].iso8601)

    expect(response).not_to be_error
    refetched = run_mcp_tool(McpServer::Tools::GetNavBarItems, params: {}, current_user:).structured_content
    strip = ->(items) { items.map { |item| item.except(:id, :children).merge(children: item[:children].map { |child| child.except(:id) }) } }
    expect(strip.call(refetched[:items])).to eq strip.call(fetched[:items])
  end

  it 'refuses when home is missing or not first' do
    project = create(:project)

    response = run(items: [{ project_id: project.id }, home])

    expect(response).to be_error
    expect(response.content.sole[:text]).to include("'home'")
    expect(NavBarItem.count).to eq 0
  end

  it 'refuses more top-level items than the admin UI supports' do
    response = run(items: [home] + Array.new(7) { home })

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('At most 7')
  end

  it 'refuses a custom item with no target, or more than one' do
    page = create(:static_page)
    project = create(:project)

    response = run(items: [home, { title_multiloc: { 'en' => 'Nowhere' } }])
    expect(response).to be_error
    expect(response.content.sole[:text]).to include('exactly one of')

    response = run(items: [home, { static_page_id: page.id, project_id: project.id }])
    expect(response).to be_error
    expect(response.content.sole[:text]).to include('exactly one of')
  end

  it 'drops blank target ids instead of writing them' do
    project = create(:project)

    response = run(items: [home, { static_page_id: '', project_id: project.id }])

    expect(response).not_to be_error
    item = NavBarItem.top_level.order(:ordering).last
    expect(item.static_page_id).to be_nil
    expect(item.project_id).to eq project.id
  end

  it 'refuses a built-in item with a target or children' do
    page = create(:static_page)

    response = run(items: [home, { code: 'events', static_page_id: page.id }])

    expect(response).to be_error
    expect(response.content.sole[:text]).to include("built-in 'events'")
  end

  it 'refuses a dropdown with a target of its own, and one without a title' do
    page = create(:static_page)

    response = run(items: [home, {
      title_multiloc: { 'en' => 'Mixed' },
      static_page_id: page.id,
      children: [{ static_page_id: page.id }]
    }])
    expect(response).to be_error
    expect(response.content.sole[:text]).to include('no target of its own')

    response = run(items: [home, { children: [{ static_page_id: page.id }] }])
    expect(response).to be_error
    expect(response.content.sole[:text]).to include('needs a title_multiloc')
  end

  it 'returns structured validation errors for a project-scoped page and keeps the navbar intact' do
    create(:nav_bar_item, code: 'home', static_page: nil)
    project_page = create(:static_page, :project_scoped)

    response = run(items: [home, { static_page_id: project_page.id }])

    expect(response).to be_error
    expect(response.structured_content[:errors]).to be_present
    expect(NavBarItem.top_level.sole.code).to eq 'home'
  end

  it 'leaves the original navbar intact when an entry fails mid-rebuild' do
    original = create(:nav_bar_item, code: 'home', static_page: nil)

    response = run(items: [home, { static_page_id: SecureRandom.uuid }])

    expect(response).to be_error
    expect(NavBarItem.top_level.sole.id).to eq original.id
  end

  it 'refuses a stale nav_last_updated_at and accepts a fresh or missing one' do
    item = create(:nav_bar_item, code: 'home', static_page: nil)

    response = run(items: [home], nav_last_updated_at: (item.updated_at - 1.hour).iso8601)
    expect(response).to be_error
    expect(response.content.sole[:text]).to include('changed since you fetched it')

    response = run(items: [home], nav_last_updated_at: NavBarItem.maximum(:updated_at).iso8601)
    expect(response).not_to be_error

    response = run(items: [home])
    expect(response).not_to be_error
  end

  it 'refuses an unparseable nav_last_updated_at' do
    response = run(items: [home], nav_last_updated_at: 'not-a-timestamp')

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('not a valid')
  end

  it 'logs the destroyed and created items' do
    create(:nav_bar_item, code: 'home', static_page: nil)

    run(items: [home, { code: 'projects' }])

    log_actions = ActiveJob::Base.queue_adapter.enqueued_jobs
      .select { |job| job[:job] == LogActivityJob }
      .map { |job| job[:args][1] }
    expect(log_actions).to include('deleted', 'created')
  end

  it 'refuses outside demo and trial platforms' do
    change_lifecycle_stage('active')
    item = create(:nav_bar_item, code: 'home', static_page: nil)

    response = run(items: [home])

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('demo and trial')
    expect { item.reload }.not_to raise_error
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(described_class, params: { items: [home] }, current_user: create(:user))

    expect(response).to be_error
  end
end
