# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Accordion migration rake task', type: :task do
  let(:task_name) { 'single_use:migrate_accordion_to_canvas' }
  let(:test_tenant) { create(:tenant) }

  before do
    test_tenant.switch!
  end

  describe 'migration' do
    let!(:layout) { create(:homepage_layout) }
    let(:accordion_node_id) { 'ACCORDION_1' }
    let(:text_content) { { 'en' => 'Test accordion content' } }

    before do
      # Create a layout with an accordion that has text content
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => [accordion_node_id],
          'linkedNodes' => {}
        },
        accordion_node_id => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Test Accordion' },
            'text' => text_content,
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            }
          },
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      layout.update!(craftjs_json: craftjs_json)
    end

    it 'migrates accordion with text content to canvas mode' do
      expect {
        Rake::Task[task_name].invoke
      }.to change { layout.reload.craftjs_json[accordion_node_id]['props']['isCanvas'] }
        .from(false).to(true)

      # Check that the accordion is now in canvas mode
      accordion_node = layout.reload.craftjs_json[accordion_node_id]
      expect(accordion_node['isCanvas']).to be true
      expect(accordion_node['props']['isCanvas']).to be true
      expect(accordion_node['props']['text']).to be_nil

      # Check that a TextMultiloc child was created
      expect(accordion_node['nodes']).to have(1).item
      text_node_id = accordion_node['nodes'].first
      text_node = layout.craftjs_json[text_node_id]

      expect(text_node['type']['resolvedName']).to eq('TextMultiloc')
      expect(text_node['props']['text']).to eq(text_content)
      expect(text_node['parent']).to eq(accordion_node_id)
    end

    it 'preserves existing content during migration' do
      Rake::Task[task_name].invoke

      # Verify the text content is preserved in the TextMultiloc child
      accordion_node = layout.reload.craftjs_json[accordion_node_id]
      text_node_id = accordion_node['nodes'].first
      text_node = layout.craftjs_json[text_node_id]

      expect(text_node['props']['text']).to eq(text_content)
    end

    it 'skips accordions that are already migrated' do
      # First migration
      Rake::Task[task_name].invoke

      # Second migration should not change anything
      expect {
        Rake::Task[task_name].invoke
      }.not_to change { layout.reload.craftjs_json[accordion_node_id]['props']['isCanvas'] }
    end

    it 'skips accordions with empty text content' do
      # Update accordion to have empty text
      craftjs_json = layout.craftjs_json
      craftjs_json[accordion_node_id]['props']['text'] = { 'en' => '' }
      layout.update!(craftjs_json: craftjs_json)

      expect {
        Rake::Task[task_name].invoke
      }.not_to change { layout.reload.craftjs_json[accordion_node_id]['props']['isCanvas'] }
    end

    it 'handles multiple accordions in the same layout' do
      # Add another accordion to the layout
      accordion_node_2_id = 'ACCORDION_2'
      craftjs_json = layout.craftjs_json
      craftjs_json['ROOT']['nodes'] << accordion_node_2_id
      craftjs_json[accordion_node_2_id] = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'props' => {
          'title' => { 'en' => 'Second Accordion' },
          'text' => { 'en' => 'Second accordion content' },
          'openByDefault' => false
        },
        'displayName' => 'AccordionMultiloc',
        'custom' => {
          'title' => {
            'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
            'defaultMessage' => 'Accordion'
          }
        },
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
      layout.update!(craftjs_json: craftjs_json)

      Rake::Task[task_name].invoke

      # Check that both accordions were migrated
      layout.reload
      expect(layout.craftjs_json[accordion_node_id]['props']['isCanvas']).to be true
      expect(layout.craftjs_json[accordion_node_2_id]['props']['isCanvas']).to be true
    end
  end

  describe 'rollback' do
    let(:task_name) { 'single_use:rollback_accordion_migration' }
    let!(:layout) { create(:homepage_layout) }
    let(:accordion_node_id) { 'ACCORDION_1' }
    let(:text_node_id) { 'TEXT_1' }

    before do
      # Create a layout with a migrated accordion (canvas mode with TextMultiloc child)
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => [accordion_node_id],
          'linkedNodes' => {}
        },
        accordion_node_id => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => true,
          'props' => {
            'title' => { 'en' => 'Test Accordion' },
            'isCanvas' => true,
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            }
          },
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [text_node_id],
          'linkedNodes' => {}
        },
        text_node_id => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'props' => { 'text' => { 'en' => 'Test accordion content' } },
          'parent' => accordion_node_id,
          'isCanvas' => false,
          'nodes' => [],
          'linkedNodes' => {},
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'displayName' => 'TextMultiloc'
        }
      }

      layout.update!(craftjs_json: craftjs_json)
    end

    it 'rolls back migrated accordion to text mode' do
      expect {
        Rake::Task[task_name].invoke
      }.to change { layout.reload.craftjs_json[accordion_node_id]['props']['isCanvas'] }
        .from(true).to(false)

      # Check that the accordion is back to text mode
      accordion_node = layout.reload.craftjs_json[accordion_node_id]
      expect(accordion_node['isCanvas']).to be false
      expect(accordion_node['props']['isCanvas']).to be_nil
      expect(accordion_node['props']['text']).to eq({ 'en' => 'Test accordion content' })
      expect(accordion_node['nodes']).to be_empty

      # Check that the TextMultiloc child was removed
      expect(layout.craftjs_json[text_node_id]).to be_nil
    end

    it 'preserves text content during rollback' do
      Rake::Task[task_name].invoke

      # Verify the text content is preserved in the accordion
      accordion_node = layout.reload.craftjs_json[accordion_node_id]
      expect(accordion_node['props']['text']).to eq({ 'en' => 'Test accordion content' })
    end
  end

  describe 'test migration' do
    let(:task_name) { 'single_use:test_accordion_migration' }

    it 'analyzes migration without making changes' do
      # Create a layout with accordions
      layout = create(:homepage_layout)
      craftjs_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => ['ACCORDION_1', 'ACCORDION_2'],
          'linkedNodes' => {}
        },
        'ACCORDION_1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Test Accordion' },
            'text' => { 'en' => 'Test content' },
            'openByDefault' => true
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            }
          },
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'ACCORDION_2' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'isCanvas' => false,
          'props' => {
            'title' => { 'en' => 'Empty Accordion' },
            'text' => { 'en' => '' },
            'openByDefault' => false
          },
          'displayName' => 'AccordionMultiloc',
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            }
          },
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }
      layout.update!(craftjs_json: craftjs_json)

      # The test should not modify the layout
      expect {
        Rake::Task[task_name].invoke
      }.not_to change { layout.reload.craftjs_json }

      # Verify the layout is unchanged
      expect(layout.reload.craftjs_json['ACCORDION_1']['props']['isCanvas']).to be false
      expect(layout.reload.craftjs_json['ACCORDION_2']['props']['isCanvas']).to be false
    end
  end
end
