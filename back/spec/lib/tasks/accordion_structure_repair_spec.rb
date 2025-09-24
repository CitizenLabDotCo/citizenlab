# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AccordionStructureRepair do
  let(:repair) { described_class.new(dry_run: true) }
  let(:tenant) { create(:tenant) }
  let(:layout) { create(:content_builder_layout) }

  describe '#find_broken_accordions' do
    let(:type_a_broken) do
      {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => true,
        'linkedNodes' => {}
      }
    end

    let(:type_b_needs_migration) do
      {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'props' => {
          'text' => {
            'en' => 'Some text content'
          }
        }
      }
    end

    let(:valid_accordion) do
      {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'linkedNodes' => {
          'accordion-content' => 'container_id'
        }
      }
    end

    it 'identifies Type A accordions with missing linkedNodes' do
      accordion_nodes = { 'node1' => type_a_broken }
      broken = repair.send(:find_broken_accordions, accordion_nodes)
      expect(broken).to include('node1' => type_a_broken)
    end

    it 'identifies Type B accordions with text property' do
      accordion_nodes = { 'node1' => type_b_needs_migration }
      broken = repair.send(:find_broken_accordions, accordion_nodes)
      expect(broken).to include('node1' => type_b_needs_migration)
    end

    it 'ignores valid accordions' do
      accordion_nodes = { 'node1' => valid_accordion }
      broken = repair.send(:find_broken_accordions, accordion_nodes)
      expect(broken).to be_empty
    end
  end

  describe '#fix_accordion_node' do
    let(:layout_json) { {} }
    let(:layout) { create(:content_builder_layout, craftjs_json: layout_json) }

    it 'fixes Type A accordions by adding proper container' do
      node = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => true,
        'props' => { 'title' => { 'en' => 'Title' } }
      }

      expect do
        repair.send(:fix_accordion_node, layout, 'node1', node)
      end.to change { node['isCanvas'] }.from(true).to(false)
        .and change { node['linkedNodes'] }.from(nil)
        .and change { node['custom'] }
    end

    it 'fixes Type B accordions by migrating text content' do
      node = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'props' => {
          'text' => { 'en' => 'Content' },
          'title' => { 'en' => 'Title' }
        }
      }

      expect do
        repair.send(:fix_accordion_node, layout, 'node1', node)
      end.to change { node['linkedNodes'] }.from(nil)
        .and change { node['props'] }
    end

    it 'maintains existing content when fixing Type B accordions' do
      original_text = { 'en' => 'Original content' }
      node = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'isCanvas' => false,
        'props' => {
          'text' => original_text,
          'title' => { 'en' => 'Title' }
        }
      }

      repair.send(:fix_accordion_node, layout, 'node1', node)
      container_id = node['linkedNodes']['accordion-content']
      text_node_id = layout.craftjs_json[container_id]['nodes'].first
      expect(layout.craftjs_json[text_node_id]['props']['text']).to eq(original_text)
    end
  end

  describe '#run' do
    before do
      allow(Tenant).to receive(:find_by!).and_return(tenant)
      allow(tenant).to receive(:switch).and_yield
      allow(ContentBuilder::Layout).to receive(:find_each).and_yield(layout)
    end

    it 'processes all layouts in the tenant' do
      expect(ContentBuilder::Layout).to receive(:find_each)
      repair.run('test.tenant.com')
    end

    it 'returns accurate statistics' do
      allow(repair).to receive(:process_layout).and_return(
        total_accordions: 5,
        broken_accordions: 2,
        fixed_accordions: 2
      )

      stats = repair.run('test.tenant.com')
      expect(stats[:total_accordions]).to eq(5)
      expect(stats[:broken_accordions]).to eq(2)
      expect(stats[:fixed_accordions]).to eq(2)
      expect(stats[:layouts_affected]).to eq(1)
    end

    context 'when in dry run mode' do
      it 'does not save layout changes' do
        expect(layout).not_to receive(:save!)
        repair.run('test.tenant.com')
      end
    end

    context 'when not in dry run mode' do
      let(:repair) { described_class.new(dry_run: false) }

      it 'saves layout changes when fixes are applied' do
        allow(repair).to receive(:process_layout).and_return(fixed_accordions: 1)
        expect(layout).to receive(:save!)
        repair.run('test.tenant.com')
      end
    end
  end
end
