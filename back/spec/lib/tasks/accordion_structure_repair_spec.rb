# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../lib/accordion_structure_repair'

RSpec.describe 'single_use:repair_broken_accordions' do # rubocop:disable RSpec/DescribeClass
  let(:tenant) { create(:tenant) }
  let(:layout) { create(:layout, code: 'project_description') }
  let(:repair_service_dry_run) { AccordionStructureRepair.new(dry_run: true) }
  let(:repair_service_fix) { AccordionStructureRepair.new(dry_run: false) }

  before do
    load_rake_tasks_if_not_loaded
    Rake::Task['single_use:repair_broken_accordions'].reenable
    allow(Tenant).to receive(:find_by!).and_return(tenant)
    allow(tenant).to receive(:switch).and_yield
    allow(ContentBuilder::Layout).to receive(:find_each).and_yield(layout)
  end

  context 'when run in dry run mode' do
    it 'identifies broken accordions without modifying them' do
      layout.craftjs_json = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[accordion1], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
        'accordion1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'props' => { 'title' => { 'en' => 'Test Accordion' } },
          'isCanvas' => true, # Incorrectly marked as container
          'linkedNodes' => {}
        }
      }

      Apartment::Tenant.switch(tenant.host) do
        expect do
          Rake::Task['single_use:repair_broken_accordions'].invoke
        end.not_to change { layout.reload.craftjs_json }
      end
    end
  end

  context 'when run in fix mode' do
    it 'fixes broken container-based accordions by adding proper structure' do
      layout.craftjs_json = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[accordion1], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
        'accordion1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'props' => { 'title' => { 'en' => 'Test Accordion' } },
          'isCanvas' => true, # Missing container structure
          'linkedNodes' => {}
        }
      }

      Apartment::Tenant.switch(tenant.host) do
        Rake::Task['single_use:repair_broken_accordions'].invoke
        fixed_accordion = layout.reload.craftjs_json['accordion1']
        expect(fixed_accordion['isCanvas']).to be false
        expect(fixed_accordion['linkedNodes']).to have_key('accordion-content')
        container_id = fixed_accordion['linkedNodes']['accordion-content']
        expect(layout.craftjs_json[container_id]['isCanvas']).to be true
        expect(layout.craftjs_json[container_id]['nodes']).not_to be_empty
        expect(layout.craftjs_json[layout.craftjs_json[container_id]['nodes'].first]['props']['text']['es-CL']).to include('Contenido del acordeón')
      end
    end

    it 'migrates legacy text-based accordions to container structure' do
      layout.craftjs_json = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[accordion1], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
        'accordion1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'props' => { 'title' => { 'en' => 'Test Accordion' }, 'text' => { 'en' => 'Original content' } },
          'isCanvas' => false,
          'linkedNodes' => {}
        }
      }

      Apartment::Tenant.switch(tenant.host) do
        Rake::Task['single_use:repair_broken_accordions'].invoke
        fixed_accordion = layout.reload.craftjs_json['accordion1']
        expect(fixed_accordion['isCanvas']).to be false
        expect(fixed_accordion['props']).not_to have_key('text') # Text prop removed
        expect(fixed_accordion['linkedNodes']).to have_key('accordion-content')
        container_id = fixed_accordion['linkedNodes']['accordion-content']
        expect(layout.craftjs_json[container_id]['isCanvas']).to be true
        expect(layout.craftjs_json[container_id]['nodes']).not_to be_empty
        expect(layout.craftjs_json[layout.craftjs_json[container_id]['nodes'].first]['props']['text']['en']).to eq('Original content')
      end
    end

    it 'does not modify valid accordions' do
      layout.craftjs_json = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[accordion1], 'props' => { 'id' => 'e2e-content-builder-frame' }, 'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {} },
        'accordion1' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'props' => { 'title' => { 'en' => 'Valid Accordion' } },
          'isCanvas' => false,
          'linkedNodes' => { 'accordion-content' => 'container1' }
        },
        'container1' => {
          'type' => { 'resolvedName' => 'Container' },
          'isCanvas' => true,
          'nodes' => %w[text1],
          'parent' => 'accordion1'
        },
        'text1' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'props' => { 'text' => { 'en' => 'Valid content' } },
          'isCanvas' => false,
          'parent' => 'container1'
        }
      }
      original_json = layout.craftjs_json.deep_dup

      Apartment::Tenant.switch(tenant.host) do
        Rake::Task['single_use:repair_broken_accordions'].invoke
        expect(layout.reload.craftjs_json).to eq(original_json)
      end
    end
  end
end