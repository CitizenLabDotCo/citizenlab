# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateHomepageLayout do
  let(:current_user) { create(:super_admin) }
  # Spec tenants may already carry a seeded homepage layout; start from a known one.
  let!(:layout) do
    ContentBuilder::Layout.where(code: 'homepage').delete_all
    create(:homepage_layout, craftjs_json: homepage_craftjs)
  end

  before { change_lifecycle_stage('demo') }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'adds a widget under ROOT' do
    root = layout.craftjs_json['ROOT'].merge('nodes' => %w[HOMEPAGEBANNER PROJECTS NEW])
    response = run(nodes: {
      'ROOT' => root,
      'NEW' => craftjs_node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hi</p>' } })
    })

    expect(response).not_to be_error
    expect(layout.reload.craftjs_json).to have_key('NEW')
    expect(layout.craftjs_json['ROOT']['nodes']).to eq(%w[HOMEPAGEBANNER PROJECTS NEW])
  end

  it 'edits the fixed HomepageBanner and keeps its noDelete flag even if the patch drops it' do
    banner = layout.craftjs_json['HOMEPAGEBANNER'].merge(
      'props' => { 'homepageSettings' => { 'banner_layout' => 'two_row_layout' }, 'image' => {} },
      'custom' => { 'title' => 'Banner' } # deliberately omits noDelete
    )
    response = run(nodes: { 'HOMEPAGEBANNER' => banner })

    expect(response).not_to be_error
    stored = layout.reload.craftjs_json['HOMEPAGEBANNER']
    expect(stored.dig('props', 'homepageSettings', 'banner_layout')).to eq('two_row_layout')
    expect(stored.dig('custom', 'noDelete')).to be(true)
  end

  it 'refuses to delete a fixed widget, saving nothing' do
    response = run(delete_node_ids: ['HOMEPAGEBANNER'])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('cannot be deleted')
    expect(layout.reload.craftjs_json).to have_key('HOMEPAGEBANNER')
  end

  it 'refuses to delete the banner even when it lacks a noDelete marker (older seeds)' do
    graph = homepage_craftjs
    graph['HOMEPAGEBANNER']['custom'] = {}
    layout.update_column(:craftjs_json, graph)

    response = run(delete_node_ids: ['HOMEPAGEBANNER'])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('cannot be deleted')
    expect(layout.reload.craftjs_json).to have_key('HOMEPAGEBANNER')
  end

  it 'refuses to change the banner to a different widget type' do
    retyped = layout.craftjs_json['HOMEPAGEBANNER'].merge('type' => { 'resolvedName' => 'TextMultiloc' })
    response = run(nodes: { 'HOMEPAGEBANNER' => retyped })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('type cannot be changed')
    expect(layout.reload.craftjs_json.dig('HOMEPAGEBANNER', 'type', 'resolvedName')).to eq('HomepageBanner')
  end

  it 'refuses to reparent the banner' do
    moved = layout.craftjs_json['HOMEPAGEBANNER'].merge('parent' => 'PROJECTS')
    response = run(nodes: { 'HOMEPAGEBANNER' => moved })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('cannot be moved to another parent')
  end

  it 'refuses to add a second HomepageBanner' do
    root = layout.craftjs_json['ROOT'].merge('nodes' => %w[HOMEPAGEBANNER PROJECTS BANNER2])
    response = run(nodes: { 'ROOT' => root, 'BANNER2' => craftjs_node('HomepageBanner', parent: 'ROOT') })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('only be one HomepageBanner')
    expect(layout.reload.craftjs_json).not_to have_key('BANNER2')
  end

  it 'refuses to move the banner off the first position in ROOT' do
    root = layout.craftjs_json['ROOT'].merge('nodes' => %w[PROJECTS HOMEPAGEBANNER])
    response = run(nodes: { 'ROOT' => root })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('must stay the first item in ROOT')
    expect(layout.reload.craftjs_json['ROOT']['nodes']).to eq(%w[HOMEPAGEBANNER PROJECTS])
  end

  it 'rejects an unsupported widget and returns a widget reference' do
    root = layout.craftjs_json['ROOT'].merge('nodes' => %w[HOMEPAGEBANNER PROJECTS BAD])
    response = run(nodes: { 'ROOT' => root, 'BAD' => craftjs_node('ProjectBanner', parent: 'ROOT') })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('not supported')
    expect(layout.reload.craftjs_json).not_to have_key('BAD')
  end

  context 'with an events widget filtered by area' do
    let(:area_events) do
      craftjs_node('EventsList', parent: 'ROOT', props: { 'source' => 'areas', 'ids' => [create(:area).id] })
    end
    let(:root_with_events) { layout.craftjs_json['ROOT'].merge('nodes' => %w[HOMEPAGEBANNER PROJECTS EVENTS]) }

    # Filtering is for custom pages, so not even the paid plan unlocks it here.
    it 'refuses it, even with advanced_custom_pages, saving nothing' do
      SettingsService.new.activate_feature!('advanced_custom_pages')
      response = run(nodes: { 'ROOT' => root_with_events, 'EVENTS' => area_events })

      expect(response).to be_error
      expect(response.content.first[:text]).to include('cannot be filtered')
      expect(layout.reload.craftjs_json).not_to have_key('EVENTS')
    end

    context 'when the widget already filters' do
      before do
        layout.update!(craftjs_json: layout.craftjs_json.merge('ROOT' => root_with_events, 'EVENTS' => area_events))
      end

      # A filter set before filtering left the homepage must not block edits to the rest of the page.
      it 'still saves an unrelated edit' do
        text = craftjs_node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hi</p>' } })
        root = root_with_events.merge('nodes' => %w[HOMEPAGEBANNER PROJECTS EVENTS NEW])

        response = run(nodes: { 'ROOT' => root, 'NEW' => text })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json).to have_key('NEW')
      end

      # Clients send a node in full, so editing anything else on it re-sends its filter.
      it 'saves an edit that keeps its filter' do
        edited = area_events.deep_merge('props' => { 'limit' => 6 })

        response = run(nodes: { 'EVENTS' => edited })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json.dig('EVENTS', 'props')).to include('source' => 'areas', 'limit' => 6)
      end

      it 'refuses switching it to another filter' do
        switched = area_events.deep_merge('props' => { 'source' => 'global_topics', 'ids' => [] })

        response = run(nodes: { 'EVENTS' => switched })

        expect(response).to be_error
        expect(layout.reload.craftjs_json.dig('EVENTS', 'props', 'source')).to eq('areas')
      end

      it 'saves resetting it to every project' do
        reset = area_events.deep_merge('props' => { 'source' => 'all', 'ids' => [] })

        response = run(nodes: { 'EVENTS' => reset })

        expect(response).not_to be_error
        expect(layout.reload.craftjs_json.dig('EVENTS', 'props', 'source')).to eq('all')
      end
    end
  end

  it 'refuses on a non-demo/trial platform' do
    change_lifecycle_stage('active')
    response = run(nodes: { 'PROJECTS' => layout.craftjs_json['PROJECTS'] })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial')
  end

  it 'refuses a non-admin user' do
    response = run_mcp_tool(described_class, params: { nodes: {} }, current_user: create(:user))

    expect(response).to be_error
    expect(layout.reload.craftjs_json).to eq(homepage_craftjs)
  end
end
