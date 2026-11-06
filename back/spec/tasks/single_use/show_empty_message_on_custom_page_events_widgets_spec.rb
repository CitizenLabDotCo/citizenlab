# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:show_empty_message_on_custom_page_events_widgets' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:show_empty_message_on_custom_page_events_widgets'] }
  let(:events_widget_name) { ContentBuilder::Craftjs::Nodes::EVENTS_WIDGET_NAME }

  after do
    task.reenable
    %w[
      show_empty_message_on_custom_page_events_widgets.json
      show_empty_message_on_custom_page_events_widgets_dry_run.json
    ].each { |file| FileUtils.rm_f(file) }
  end

  def graph(props)
    {
      'ROOT' => {
        'type' => 'div', 'isCanvas' => true, 'props' => {}, 'displayName' => 'div', 'custom' => {},
        'hidden' => false, 'nodes' => %w[text1 events1], 'linkedNodes' => {}, 'parent' => nil
      },
      'text1' => {
        'type' => { 'resolvedName' => 'TextMultiloc' }, 'isCanvas' => false, 'props' => { 'text' => { 'en' => 'Hi' } },
        'displayName' => 'TextMultiloc', 'custom' => {}, 'hidden' => false, 'nodes' => [], 'linkedNodes' => {},
        'parent' => 'ROOT'
      },
      'events1' => ContentBuilder::Craftjs::Nodes.events(props, 'ROOT')
    }
  end

  def custom_page_layout(props = { 'source' => 'all', 'limit' => 3 })
    create(
      :layout,
      content_buildable: create(:static_page),
      code: ContentBuilder::CustomPageLayoutService::CODE,
      craftjs_json: graph(props)
    )
  end

  def project_page_layout
    create(
      :layout,
      code: ContentBuilder::ProjectPageLayoutService::CODE,
      craftjs_json: graph(ContentBuilder::ProjectPageLayoutService::EVENTS_PROPS.dup)
    )
  end

  def events_props(layout)
    layout.reload.craftjs_json.dig('events1', 'props')
  end

  it 'counts the widgets it would change and writes nothing on a dry run' do
    layout = custom_page_layout

    expect { task.invoke }.to output(/widgets to change: 1/).to_stdout

    expect(events_props(layout)).not_to have_key('showEmptyMessage')
    report = JSON.parse(File.read('show_empty_message_on_custom_page_events_widgets_dry_run.json'))
    expect(report['changes'].size).to eq 1
  end

  it 'switches the message on and keeps the other props' do
    layout = custom_page_layout

    task.invoke('execute')

    expect(events_props(layout)).to eq('source' => 'all', 'limit' => 3, 'showEmptyMessage' => true)
    expect(layout.reload.craftjs_json['text1']['props']).to eq('text' => { 'en' => 'Hi' })
  end

  # Craft.js stores every node at the top level of the graph, whatever its depth, so a widget in a
  # column of a column is found like any other.
  it 'switches on every widget in a layout, including one nested in columns' do
    container = lambda do |parent|
      {
        'type' => { 'resolvedName' => 'Container' }, 'isCanvas' => true, 'props' => {}, 'displayName' => 'Container',
        'custom' => {}, 'hidden' => false, 'nodes' => [], 'linkedNodes' => {}, 'parent' => parent
      }
    end
    two_column = lambda do |id, parent|
      {
        'type' => { 'resolvedName' => 'TwoColumn' }, 'isCanvas' => false, 'props' => { 'columnLayout' => '1-1' },
        'displayName' => 'TwoColumn', 'custom' => { 'hasChildren' => true }, 'hidden' => false, 'nodes' => [],
        'linkedNodes' => { 'left' => "#{id}_left", 'right' => "#{id}_right" }, 'parent' => parent
      }
    end
    json = graph('source' => 'all').merge(
      'outer' => two_column.call('outer', 'ROOT'),
      'outer_left' => container.call('outer').merge('nodes' => ['inner']),
      'outer_right' => container.call('outer'),
      'inner' => two_column.call('inner', 'outer_left'),
      'inner_left' => container.call('inner').merge('nodes' => ['events2']),
      'inner_right' => container.call('inner'),
      'events2' => ContentBuilder::Craftjs::Nodes.events({ 'source' => 'all' }, 'inner_left')
    )
    json['ROOT']['nodes'] += ['outer']
    layout = create(
      :layout,
      content_buildable: create(:static_page),
      code: ContentBuilder::CustomPageLayoutService::CODE,
      craftjs_json: json
    )

    task.invoke('execute')

    craftjs = layout.reload.craftjs_json
    expect(craftjs.dig('events1', 'props', 'showEmptyMessage')).to be true
    expect(craftjs.dig('events2', 'props', 'showEmptyMessage')).to be true
  end

  it 'keeps a widget an admin switched off' do
    layout = custom_page_layout('source' => 'all', 'showEmptyMessage' => false)

    task.invoke('execute')

    expect(events_props(layout)['showEmptyMessage']).to be false
  end

  it 'leaves project description pages alone' do
    layout = project_page_layout

    task.invoke('execute')

    expect(events_props(layout)).not_to have_key('showEmptyMessage')
  end
end
# rubocop:enable RSpec/DescribeClass
