# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:migrate_events_widgets' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:migrate_events_widgets'] }
  let(:canonical) { ContentBuilder::Craftjs::Nodes::EVENTS_WIDGET_NAME }
  let(:after_earliest_date) { Date.new(2026, 10, 1) }

  after do
    task.reenable
    %w[
      migrate_events_widgets.json
      migrate_events_widgets_dry_run.json
      migrate_events_widgets_revert.json
      migrate_events_widgets_revert_dry_run.json
    ].each { |file| FileUtils.rm_f(file) }
  end

  def graph(name, props: {}, hidden: false)
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
      'events1' => {
        'type' => { 'resolvedName' => name }, 'isCanvas' => false, 'props' => props, 'displayName' => name,
        'custom' => { 'title' => { 'id' => 'x', 'defaultMessage' => 'Events' }, 'noPointerEvents' => true },
        'hidden' => hidden, 'nodes' => [], 'linkedNodes' => {}, 'parent' => 'ROOT'
      }
    }
  end

  def homepage_layout(name, **)
    create(:homepage_layout, craftjs_json: graph(name, **))
  end

  def project_page_layout(name, **)
    create(:layout, code: ContentBuilder::ProjectPageLayoutService::CODE, craftjs_json: graph(name, **))
  end

  def custom_page_layout(name, **)
    create(
      :layout,
      content_buildable: create(:static_page),
      code: ContentBuilder::CustomPageLayoutService::CODE,
      craftjs_json: graph(name, **)
    )
  end

  def events_node(layout)
    layout.reload.craftjs_json['events1']
  end

  describe 'dry run' do
    it 'counts the nodes it would rewrite and writes nothing' do
      homepage = homepage_layout('Events')
      project_page = project_page_layout('EventsWidget')

      expect { task.invoke }.to output(/Events \+ EventsWidget nodes found: 2/).to_stdout

      expect(events_node(homepage).dig('type', 'resolvedName')).to eq 'Events'
      expect(events_node(project_page).dig('type', 'resolvedName')).to eq 'EventsWidget'
      report = JSON.parse(File.read('migrate_events_widgets_dry_run.json'))
      expect(report['changes'].size).to eq 2
    end

    it 'marks template tenants in the per-tenant lines' do
      Tenant.current.update!(host: 'demo.template.govocal.com')
      homepage_layout('Events')

      expect { task.invoke }.to output(/demo\.template\.govocal\.com \(template\): Events=1/).to_stdout
    end
  end

  describe 'execute' do
    before { travel_to(after_earliest_date) }

    it 'rewrites a homepage node with the props of the homepage widget' do
      homepage = homepage_layout('Events', hidden: true)

      task.invoke('execute')

      node = events_node(homepage)
      expect(node.dig('type', 'resolvedName')).to eq canonical
      expect(node['displayName']).to eq canonical
      expect(node['props']).to eq(
        'source' => 'all',
        'timeFilters' => ['upcoming'],
        'limit' => 3,
        'projectPublicationStatuses' => ['published'],
        'showEmptyMessage' => true
      )
      expect(node['parent']).to eq 'ROOT'
      expect(node['hidden']).to be true
      expect(node.dig('custom', 'title', 'id')).to eq 'app.components.admin.ContentBuilder.Widgets.Events.eventsListTitle'
    end

    it 'rewrites a project page node with the props of the project page widget' do
      project_page = project_page_layout('EventsWidget')

      task.invoke('execute')

      node = events_node(project_page)
      expect(node.dig('type', 'resolvedName')).to eq canonical
      expect(node['props']).to eq('source' => 'currentProject', 'timeFilters' => %w[upcoming past], 'limit' => 'all')
    end

    it 'leaves other nodes and layouts alone' do
      homepage = homepage_layout('Events')
      already = project_page_layout(canonical, props: { 'source' => 'areas', 'ids' => ['a'] })

      task.invoke('execute')

      expect(events_node(homepage)['props']['source']).to eq 'all'
      expect(homepage.reload.craftjs_json['text1']['props']).to eq('text' => { 'en' => 'Hi' })
      expect(events_node(already)['props']).to eq('source' => 'areas', 'ids' => ['a'])
      expect(homepage.reload.craftjs_json['ROOT']['nodes']).to eq %w[text1 events1]
    end
  end

  describe 'the date guard' do
    it 'refuses to execute before the earliest date and writes nothing' do
      homepage = homepage_layout('Events')

      travel_to(after_earliest_date - 1) do
        expect { task.invoke('execute') }.to raise_error(ArgumentError, /refusing to execute before/)
      end

      expect(events_node(homepage).dig('type', 'resolvedName')).to eq 'Events'
    end

    it 'executes before the earliest date when forced' do
      homepage = homepage_layout('Events')

      travel_to(after_earliest_date - 1) { task.invoke('execute', nil, nil, 'force') }

      expect(events_node(homepage).dig('type', 'resolvedName')).to eq canonical
    end

    it 'does not apply to a dry run' do
      homepage_layout('Events')

      travel_to(after_earliest_date - 1) do
        expect { task.invoke }.not_to raise_error
      end
    end
  end

  describe 'revert' do
    it 'renames a homepage node back and drops its props' do
      homepage = homepage_layout(canonical, props: { 'source' => 'all', 'limit' => 3 })

      task.invoke('execute', nil, 'revert')

      node = events_node(homepage)
      expect(node.dig('type', 'resolvedName')).to eq 'Events'
      expect(node['displayName']).to eq 'Events'
      expect(node['props']).to eq({})
      expect(node.dig('custom', 'title', 'id')).to eq 'app.containers.admin.ContentBuilder.homepage.events.eventsTitle'
      expect(node.dig('custom', 'noPointerEvents')).to be true
    end

    it 'renames a project page node back' do
      project_page = project_page_layout(canonical, props: { 'source' => 'currentProject' })

      task.invoke('execute', nil, 'revert')

      node = events_node(project_page)
      expect(node.dig('type', 'resolvedName')).to eq 'EventsWidget'
      expect(node.dig('custom', 'title', 'id')).to eq 'app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle'
    end

    it 'removes a node from a surface that had no events widget, and records it' do
      custom_page = custom_page_layout(canonical, props: { 'source' => 'areas' })

      task.invoke('execute', nil, 'revert')

      json = custom_page.reload.craftjs_json
      expect(json).not_to have_key('events1')
      expect(json['ROOT']['nodes']).to eq ['text1']
      report = JSON.parse(File.read('migrate_events_widgets_revert.json'))
      expect(report['deletes'].first.dig('context', 'node', 'props')).to eq('source' => 'areas')
    end

    it 'is not held by the date guard' do
      homepage = homepage_layout(canonical)

      travel_to(after_earliest_date - 1) { task.invoke('execute', nil, 'revert') }

      expect(events_node(homepage).dig('type', 'resolvedName')).to eq 'Events'
    end

    it 'can be dry run' do
      homepage = homepage_layout(canonical)

      expect { task.invoke(nil, nil, 'revert') }.to output(/#{canonical} nodes found: 1/).to_stdout

      expect(events_node(homepage).dig('type', 'resolvedName')).to eq canonical
    end
  end
end
# rubocop:enable RSpec/DescribeClass
