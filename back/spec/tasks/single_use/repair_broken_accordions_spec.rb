# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:repair_broken_accordions' do # rubocop:disable RSpec/DescribeClass
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  let(:tenant) { create(:tenant, host: 'participaconenergia.minenergia.cl') }
  let(:layout) { create(:layout, code: 'project_description') }

  let(:type_a_broken) do
    {
      'type' => { 'resolvedName' => 'AccordionMultiloc' },
      'isCanvas' => true,
      'props' => { 'title' => { 'es-CL' => 'Title' } },
      'linkedNodes' => {}
    }
  end

  let(:type_b_needs_migration) do
    {
      'type' => { 'resolvedName' => 'AccordionMultiloc' },
      'isCanvas' => false,
      'props' => {
        'text' => { 'es-CL' => 'Content' },
        'title' => { 'es-CL' => 'Title' }
      }
    }
  end

  let(:valid_accordion) do
    {
      'type' => { 'resolvedName' => 'AccordionMultiloc' },
      'isCanvas' => false,
      'props' => { 'title' => { 'es-CL' => 'Title' } },
      'linkedNodes' => {
        'accordion-content' => 'container_id'
      }
    }
  end

  before do
    tenant # Create tenant
    Rake::Task['single_use:repair_broken_accordions'].reenable

    Apartment::Tenant.switch(tenant.schema_name) do
      layout.update!(craftjs_json: {
        'ROOT' => {
          'type' => 'div',
          'nodes' => %w[accordion1 accordion2 accordion3],
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'isCanvas' => true
        },
        'accordion1' => type_a_broken,
        'accordion2' => type_b_needs_migration,
        'accordion3' => valid_accordion
      })
    end
  end

  context 'when run in dry run mode' do
    it 'identifies broken accordions without modifying them' do
      ENV['DRY_RUN'] = 'true'
      Apartment::Tenant.switch(tenant.schema_name) do
        expect do
          Rake::Task['single_use:repair_broken_accordions'].invoke
        end.not_to change { layout.reload.craftjs_json }
      end
    end
  end

  context 'when run in fix mode' do
    before do
      ENV['DRY_RUN'] = 'false'
    end

    it 'fixes Type A accordions by adding proper container structure' do
      Rake::Task['single_use:repair_broken_accordions'].invoke
      Apartment::Tenant.switch(tenant.schema_name) do
        layout.reload

        fixed_accordion = layout.craftjs_json['accordion1']
        expect(fixed_accordion['isCanvas']).to be false
        expect(fixed_accordion['linkedNodes']).to have_key('accordion-content')

        container_id = fixed_accordion['linkedNodes']['accordion-content']
        container = layout.craftjs_json[container_id]
        expect(container['isCanvas']).to be true
        expect(container['nodes']).to be_present
      end
    end

    it 'fixes Type B accordions by migrating text content' do
      Rake::Task['single_use:repair_broken_accordions'].invoke
      Apartment::Tenant.switch(tenant.schema_name) do
        layout.reload

        fixed_accordion = layout.craftjs_json['accordion2']
        expect(fixed_accordion['isCanvas']).to be false
        expect(fixed_accordion['linkedNodes']).to have_key('accordion-content')
        expect(fixed_accordion['props']).not_to have_key('text')

        container_id = fixed_accordion['linkedNodes']['accordion-content']
        container = layout.craftjs_json[container_id]
        expect(container['isCanvas']).to be true
        expect(container['nodes']).to be_present

        text_node_id = container['nodes'].first
        text_node = layout.craftjs_json[text_node_id]
        expect(text_node['props']['text']).to eq({ 'es-CL' => 'Content' })
      end
    end

    it 'does not modify valid accordions' do
      original_valid = layout.craftjs_json['accordion3'].deep_dup
      Rake::Task['single_use:repair_broken_accordions'].invoke
      Apartment::Tenant.switch(tenant.schema_name) do
        layout.reload
        expect(layout.craftjs_json['accordion3']).to eq(original_valid)
      end
    end

    it 'creates a backup of the layout before fixing' do
      Apartment::Tenant.switch(tenant.schema_name) do
        expect do
          Rake::Task['single_use:repair_broken_accordions'].invoke
        end.to change(ContentBuilder::Layout, :count).by(1)

        backup = ContentBuilder::Layout.find_by!(code: "backup/#{layout.code}/#{layout.id}")
        expect(backup.craftjs_json['accordion1']).to eq(type_a_broken)
        expect(backup.craftjs_json['accordion2']).to eq(type_b_needs_migration)
        expect(backup.content_buildable).to be_nil
      end
    end
  end
end
