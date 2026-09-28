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

  it 'rejects an unsupported widget and returns a widget reference' do
    root = layout.craftjs_json['ROOT'].merge('nodes' => %w[HOMEPAGEBANNER PROJECTS BAD])
    response = run(nodes: { 'ROOT' => root, 'BAD' => craftjs_node('ProjectBanner', parent: 'ROOT') })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('not supported')
    expect(layout.reload.craftjs_json).not_to have_key('BAD')
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
