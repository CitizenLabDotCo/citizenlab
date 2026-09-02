# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('lib/tasks/single_use/services/redundant_white_space_remover')

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_redundant_white_space_widgets' do
  def widget(name, parent, props: {}, nodes: [], linked_nodes: {})
    {
      'type' => { 'resolvedName' => name },
      'nodes' => nodes,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => false,
      'displayName' => name,
      'linkedNodes' => linked_nodes
    }
  end

  # A minimal project page: ROOT holding a body region with the given children.
  def page_json(children)
    {
      'ROOT' => {
        'type' => { 'resolvedName' => 'ProjectPageRoot' },
        'nodes' => ['BODY'],
        'props' => {},
        'custom' => { 'region' => true },
        'hidden' => false,
        'parent' => nil,
        'isCanvas' => true,
        'displayName' => 'ProjectPageRoot',
        'linkedNodes' => {}
      },
      'BODY' => {
        'type' => { 'resolvedName' => 'ProjectPageBody' },
        'nodes' => children.keys,
        'props' => {},
        'custom' => { 'region' => true },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => true,
        'displayName' => 'ProjectPageBody',
        'linkedNodes' => {}
      }
    }.merge(children.transform_values { |node| node.merge('parent' => 'BODY') })
  end

  def white_space(props = {})
    widget('WhiteSpace', 'BODY', props: props)
  end

  describe Tasks::SingleUse::Services::RedundantWhiteSpaceRemover do
    subject(:result) { described_class.new.call(json) }

    context 'with a spacer between two accordions' do
      let(:json) do
        page_json(
          'ACC1' => widget('AccordionMultiloc', 'BODY'),
          'WS' => white_space('size' => 'medium'),
          'ACC2' => widget('AccordionMultiloc', 'BODY')
        )
      end

      it 'removes the spacer node and its reference' do
        expect(result.json).not_to have_key('WS')
        expect(result.json['BODY']['nodes']).to eq %w[ACC1 ACC2]
      end

      it 'names the spacer and its neighbours' do
        expect(result.removed).to contain_exactly(
          hash_including(id: 'WS', size: 'medium', previous_widget: 'AccordionMultiloc', next_widget: 'AccordionMultiloc')
        )
      end

      it 'leaves the other nodes untouched' do
        expect(result.json['ACC1']).to eq json['ACC1']
        expect(result.json.keys).to match_array(json.keys - ['WS'])
      end

      it 'does not mutate its input' do
        expect { result }.not_to change { JSON.generate(json) }
      end
    end

    context 'with a spacer between two buttons' do
      let(:json) do
        page_json(
          'BTN1' => widget('ButtonMultiloc', 'BODY'),
          'WS' => white_space,
          'BTN2' => widget('ButtonMultiloc', 'BODY')
        )
      end

      it 'removes the spacer' do
        expect(result.json).not_to have_key('WS')
        expect(result.removed.size).to eq 1
      end
    end

    context 'with a spacer between a text widget and an accordion' do
      let(:json) do
        page_json(
          'TEXT' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space,
          'ACC' => widget('AccordionMultiloc', 'BODY')
        )
      end

      it 'removes the spacer' do
        expect(result.json).not_to have_key('WS')
      end
    end

    context 'with a run of consecutive spacers between widgets' do
      let(:json) do
        page_json(
          'BTN1' => widget('ButtonMultiloc', 'BODY'),
          'WS1' => white_space,
          'WS2' => white_space('size' => 'medium'),
          'BTN2' => widget('ButtonMultiloc', 'BODY')
        )
      end

      it 'removes the whole run' do
        expect(result.json.keys).not_to include('WS1', 'WS2')
        expect(result.json['BODY']['nodes']).to eq %w[BTN1 BTN2]
      end

      it 'reports neighbours across the run' do
        expect(result.removed).to contain_exactly(
          hash_including(id: 'WS1', previous_widget: 'ButtonMultiloc', next_widget: 'ButtonMultiloc'),
          hash_including(id: 'WS2', previous_widget: 'ButtonMultiloc', next_widget: 'ButtonMultiloc')
        )
      end
    end

    context 'with a spacer next to a full-width section' do
      let(:json) do
        page_json(
          'TEXT' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space,
          'PHASES' => widget('PhasesWidget', 'BODY')
        )
      end

      it 'removes the spacer' do
        expect(result.json).not_to have_key('WS')
      end
    end

    context 'with a divider spacer' do
      let(:json) do
        page_json(
          'TEXT1' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space('withDivider' => true),
          'TEXT2' => widget('TextMultiloc', 'BODY')
        )
      end

      it 'keeps it and lists it for review' do
        expect(result.json).to have_key('WS')
        expect(result.removed).to be_empty
        expect(result.review).to contain_exactly(hash_including(id: 'WS', reason: 'divider'))
      end
    end

    context 'with a large spacer' do
      let(:json) do
        page_json(
          'TEXT1' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space('size' => 'large'),
          'TEXT2' => widget('TextMultiloc', 'BODY')
        )
      end

      it 'keeps it and lists it for review' do
        expect(result.json).to have_key('WS')
        expect(result.review).to contain_exactly(hash_including(id: 'WS', reason: 'large'))
      end
    end

    context 'with leading and trailing spacers' do
      let(:json) do
        page_json(
          'WS1' => white_space,
          'TEXT' => widget('TextMultiloc', 'BODY'),
          'WS2' => white_space
        )
      end

      it 'keeps both and lists them for review' do
        expect(result.json.keys).to include('WS1', 'WS2')
        expect(result.removed).to be_empty
        expect(result.review).to contain_exactly(
          hash_including(id: 'WS1', reason: 'leading'),
          hash_including(id: 'WS2', reason: 'trailing')
        )
      end
    end

    context 'with a spacer bounded by a divider spacer and a widget' do
      let(:json) do
        page_json(
          'TEXT' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space,
          'DIVIDER' => white_space('withDivider' => true),
          'ACC' => widget('AccordionMultiloc', 'BODY')
        )
      end

      it 'removes the plain spacer and keeps the divider' do
        expect(result.json).not_to have_key('WS')
        expect(result.json).to have_key('DIVIDER')
        expect(result.removed).to contain_exactly(
          hash_including(id: 'WS', previous_widget: 'TextMultiloc', next_widget: 'WhiteSpace')
        )
      end
    end

    context 'with a spacer inside a column container' do
      let(:json) do
        page_json(
          'COLS' => widget('TwoColumn', 'BODY', linked_nodes: { 'left' => 'LEFT' })
        ).merge(
          'LEFT' => {
            'type' => { 'resolvedName' => 'Container' },
            'nodes' => %w[TEXT1 COL_WS TEXT2],
            'props' => {},
            'custom' => {},
            'hidden' => false,
            'parent' => 'COLS',
            'isCanvas' => true,
            'displayName' => 'Container',
            'linkedNodes' => {}
          },
          'TEXT1' => widget('TextMultiloc', 'LEFT'),
          'COL_WS' => widget('WhiteSpace', 'LEFT'),
          'TEXT2' => widget('TextMultiloc', 'LEFT')
        )
      end

      it 'removes the spacer from the column' do
        expect(result.json).not_to have_key('COL_WS')
        expect(result.json['LEFT']['nodes']).to eq %w[TEXT1 TEXT2]
      end
    end

    context 'with a spacer unexpectedly carrying children' do
      let(:json) do
        page_json(
          'TEXT1' => widget('TextMultiloc', 'BODY'),
          'WS' => white_space.merge('nodes' => ['CHILD']),
          'TEXT2' => widget('TextMultiloc', 'BODY')
        ).merge('CHILD' => widget('TextMultiloc', 'WS'))
      end

      it 'keeps it and lists it for review' do
        expect(result.json).to have_key('WS')
        expect(result.review).to contain_exactly(hash_including(id: 'WS', reason: 'has_children'))
      end
    end

    context 'with a page that only has spacers' do
      let(:json) { page_json('WS1' => white_space, 'WS2' => white_space) }

      it 'removes nothing' do
        expect(result.removed).to be_empty
        expect(result.json.keys).to include('WS1', 'WS2')
      end
    end

    context 'without any spacer' do
      let(:json) { page_json('TEXT' => widget('TextMultiloc', 'BODY')) }

      it 'returns the layout unchanged' do
        expect(result.json).to eq json
        expect(result.removed).to be_empty
        expect(result.review).to be_empty
      end
    end
  end

  describe 'the rake task' do
    subject(:run) { task.invoke('execute') }

    before { load_rake_tasks_if_not_loaded }

    let(:task) { Rake::Task['single_use:remove_redundant_white_space_widgets'] }
    let(:json) do
      page_json(
        'ACC1' => widget('AccordionMultiloc', 'BODY'),
        'WS' => white_space,
        'ACC2' => widget('AccordionMultiloc', 'BODY')
      )
    end
    let!(:layout) { create(:layout, code: 'project_page', craftjs_json: json) }

    after do
      task.reenable
      FileUtils.rm_f('remove_redundant_white_space_widgets.json')
      FileUtils.rm_f('remove_redundant_white_space_widgets_dry_run.json')
    end

    it 'removes the spacer from the stored layout' do
      run

      expect(layout.reload.craftjs_json).not_to have_key('WS')
      expect(layout.craftjs_json['BODY']['nodes']).to eq %w[ACC1 ACC2]
    end

    it 'leaves layouts with another code alone' do
      other = create(:layout, code: 'about_page', craftjs_json: json, project: create(:project))

      run

      expect(other.reload.craftjs_json).to have_key('WS')
    end

    it 'changes nothing on a dry run' do
      task.invoke

      expect(layout.reload.craftjs_json).to have_key('WS')
    end

    # The report is the rollback artifact: it must hold the layout as it was.
    it 'snapshots the layout before and after in the report' do
      run

      report = JSON.parse(File.read('remove_redundant_white_space_widgets.json'))
      change = report['changes'].sole
      expect(change['old_value']).to have_key('WS')
      expect(change['new_value']).not_to have_key('WS')
      expect(change['context']).to include('layout_id' => layout.id, 'removed_count' => 1)
      expect(report['deletes'].sole['context']).to include(
        'previous_widget' => 'AccordionMultiloc',
        'next_widget' => 'AccordionMultiloc'
      )
    end
  end
end
# rubocop:enable RSpec/DescribeClass
