# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_accordion_to_canvas' do
  before(:all) { load_rake_tasks_if_not_loaded }

  let(:task_name) { 'single_use:migrate_accordion_to_canvas' }

  describe 'migration functionality' do
    let!(:project) { create(:project) }
    let!(:homepage_layout) { create(:homepage_layout, project: project) }

    before do
      # Create a layout with accordion components
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[ACCORDION_1 ACCORDION_2],
          'linkedNodes' => {}
        },
        'ACCORDION_1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Test Accordion 1' },
            'text' => { 'en' => 'This is test content for accordion 1.' },
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'ACCORDION_2' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Test Accordion 2' },
            'text' => { 'en' => 'This is test content for accordion 2.' },
            'openByDefault' => false
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      homepage_layout.update!(craftjs_json: craftjs_json)
    end

    it 'migrates accordion components to canvas mode' do
      Rake::Task[task_name].reenable
      Rake::Task[task_name].invoke

      # Reload the layout
      homepage_layout.reload

      # Check that accordions are now in canvas mode
      accordion_one = homepage_layout.craftjs_json['ACCORDION_1']
      accordion_two = homepage_layout.craftjs_json['ACCORDION_2']

      expect(accordion_one['isCanvas']).to be true
      expect(accordion_two['isCanvas']).to be true

      # Check that text props were removed from accordions
      expect(accordion_one['props']).not_to have_key('text')
      expect(accordion_two['props']).not_to have_key('text')

      # Check that TextMultiloc nodes were created
      expect(accordion_one['nodes']).to have(1).item
      expect(accordion_two['nodes']).to have(1).item

      text_node_one_id = accordion_one['nodes'].first
      text_node_two_id = accordion_two['nodes'].first

      text_node_one = homepage_layout.craftjs_json[text_node_one_id]
      text_node_two = homepage_layout.craftjs_json[text_node_two_id]

      expect(text_node_one['type']['resolvedName']).to eq('TextMultiloc')
      expect(text_node_two['type']['resolvedName']).to eq('TextMultiloc')

      # Check that text content was preserved
      expect(text_node_one['props']['text']['en']).to eq('This is test content for accordion 1.')
      expect(text_node_two['props']['text']['en']).to eq('This is test content for accordion 2.')
    end

    it 'handles accordions without text content' do
      # Create an accordion without text content
      craftjs_json = homepage_layout.craftjs_json
      craftjs_json['ACCORDION_3'] = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'props' => {
          'title' => { 'en' => 'Empty Accordion' },
          'openByDefault' => false
        },
        'displayName' => 'AccordionMultiloc',
        'custom' => {},
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
      craftjs_json['ROOT']['nodes'] << 'ACCORDION_3'
      homepage_layout.update!(craftjs_json: craftjs_json)

      Rake::Task[task_name].reenable
      Rake::Task[task_name].invoke

      homepage_layout.reload
      accordion_three = homepage_layout.craftjs_json['ACCORDION_3']

      # Should remain unchanged (no text to migrate)
      expect(accordion_three['isCanvas']).to be false
      expect(accordion_three['nodes']).to be_empty
    end
  end

  describe 'rollback functionality' do
    let!(:project) { create(:project) }
    let!(:homepage_layout) { create(:homepage_layout, project: project) }

    before do
      # Create a layout with migrated accordion components
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => ['ACCORDION_1'],
          'linkedNodes' => {}
        },
        'ACCORDION_1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => true,
          'props' => {
            'title' => { 'en' => 'Test Accordion' },
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => ['ACCORDION_1_TEXT'],
          'linkedNodes' => {}
        },
        'ACCORDION_1_TEXT' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'isCanvas' => false,
          'props' => {
            'text' => { 'en' => 'This is test content.' }
          },
          'displayName' => 'TextMultiloc',
          'custom' => {},
          'parent' => 'ACCORDION_1',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      homepage_layout.update!(craftjs_json: craftjs_json)
    end

    it 'rolls back migrated accordion components' do
      Rake::Task['single_use:rollback_accordion_migration'].reenable
      Rake::Task['single_use:rollback_accordion_migration'].invoke

      # Reload the layout
      homepage_layout.reload

      # Check that accordion is back to text-based mode
      accordion_one = homepage_layout.craftjs_json['ACCORDION_1']

      expect(accordion_one['isCanvas']).to be false
      expect(accordion_one['nodes']).to be_empty

      # Check that text prop was restored
      expect(accordion_one['props']['text']['en']).to eq('This is test content.')

      # Check that TextMultiloc node was removed
      expect(homepage_layout.craftjs_json).not_to have_key('ACCORDION_1_TEXT')
    end
  end

  describe 'test functionality' do
    let!(:project) { create(:project) }
    let!(:homepage_layout) { create(:homepage_layout, project: project) }

    before do
      # Create a layout with mixed accordion types
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[ACCORDION_1 ACCORDION_2],
          'linkedNodes' => {}
        },
        'ACCORDION_1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Text-based Accordion' },
            'text' => { 'en' => 'This has text content.' },
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'ACCORDION_2' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => true,
          'props' => {
            'title' => { 'en' => 'Canvas Accordion' },
            'openByDefault' => false
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      homepage_layout.update!(craftjs_json: craftjs_json)
    end

    it 'analyzes accordion components without making changes' do
      Rake::Task['single_use:test_accordion_migration'].reenable
      Rake::Task['single_use:test_accordion_migration'].invoke

      # Reload the layout to ensure no changes were made
      homepage_layout.reload

      # Check that accordions remain unchanged
      accordion_one = homepage_layout.craftjs_json['ACCORDION_1']
      accordion_two = homepage_layout.craftjs_json['ACCORDION_2']

      expect(accordion_one['isCanvas']).to be false
      expect(accordion_one['props']).to have_key('text')
      expect(accordion_one['nodes']).to be_empty

      expect(accordion_two['isCanvas']).to be true
      expect(accordion_two['props']).not_to have_key('text')
      expect(accordion_two['nodes']).to be_empty
    end
  end
end
