# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::State do
  subject(:state) { described_class.new(json) }

  def load_fixture(file_name)
    Pathname.new(File.dirname(__FILE__)).join('fixtures', file_name).read
  end

  let(:json) do
    JSON.parse(load_fixture('about_this_report.layout.json'))
  end

  describe '#delete_node' do
    it 'deletes a node and its children (node tree)' do
      expect(json.size).to eq(6)
      expect(json.keys).to include('3h-Eizw2cD')
      expect(json['ROOT']['nodes']).to include('3h-Eizw2cD')

      state.delete_node('3h-Eizw2cD')

      expect(json.keys).to eq ['ROOT']
      expect(json['ROOT']['nodes']).to eq []
    end

    it 'returns the deleted nodes' do
      expected_results = json.slice(
        '3h-Eizw2cD', 'PoSwoa3Fx5', 'U7ecmS1hsI', 'dpDtvSimWx', 'x8jJUeZx0K'
      ).deep_dup

      expect(state.delete_node('3h-Eizw2cD')).to match(expected_results)
    end

    it 'fails if the node does not exist' do
      expect { state.delete_node('nonexistent') }.to raise_error(KeyError)
    end
  end

  describe '#replace_node' do
    it 'replaces a node with another node' do
      expect(json['ROOT']['nodes']).to eq ['3h-Eizw2cD']

      state.replace_node('3h-Eizw2cD', 'x8jJUeZx0K')

      expect(json['ROOT']['nodes']).to eq ['x8jJUeZx0K']
      expect(state.node('x8jJUeZx0K')['parent']).to eq('ROOT')
    end

    it 'keeps the replacing node unchanged except for its parent property' do
      before_node = json['x8jJUeZx0K'].deep_dup

      state.replace_node('3h-Eizw2cD', 'x8jJUeZx0K')

      expect(json['x8jJUeZx0K'].except('parent')).to eq before_node.except('parent')
    end

    it 'removes nodes that are disconnected by the replacement' do
      state.replace_node('3h-Eizw2cD', 'x8jJUeZx0K')
      expect(json.keys).to match_array %w[ROOT x8jJUeZx0K]
    end

    it 'does not affect the sibling nodes' do
      id1 = state.add_node(
        type: 'DummyWidget',
        parent: 'ROOT',
        props: { title: 'Dummy Widget 1' },
        index: 0
      )

      id2 = state.add_node(
        type: 'DummyWidget',
        parent: 'ROOT',
        props: { title: 'Dummy Widget 2' },
        index: -1
      )

      expect(json['ROOT']['nodes']).to eq [id1, '3h-Eizw2cD', id2] # order matters
      state.replace_node('3h-Eizw2cD', 'x8jJUeZx0K')
      expect(json['ROOT']['nodes']).to eq [id1, 'x8jJUeZx0K', id2] # order matters
    end

    it 'replaces a node with multiple nodes' do
      ids = Array.new(2) { state.add_node(type: 'DummyWidget') }

      state.replace_node('dpDtvSimWx', ids)

      expect(json.dig('U7ecmS1hsI', 'nodes')).to eq ids
      expect(json).not_to include('dpDtvSimWx')

      ids.each do |id|
        expect(json.dig(id, 'parent')).to eq('U7ecmS1hsI')
        expect(json.dig('ROOT', 'nodes')).not_to include(id)
      end
    end
  end

  describe '#add_node' do
    it 'returns the id of the new node' do
      id = state.add_node(type: 'a')

      expect(id).to be_a(String)
      expect(id.length).to eq(10)
    end

    it 'adds a node to the root' do
      id = state.add_node(resolved_name: 'DummyWidget')
      expect(json.dig('ROOT', 'nodes', -1)).to eq(id)
    end

    it 'creates a node with the correct properties' do
      id = state.add_node(
        resolved_name: 'DummyWidget',
        props: { title: 'Dummy Widget', color: 'red' },
        custom: { custom_key: 'custom_value' },
        hidden: true,
        is_canvas: true,
        display_name: 'Dummy'
      )

      # `as_json` is used to convert symbols to strings
      expect(json[id].as_json).to include(
        'type' => { 'resolvedName' => 'DummyWidget' },
        'props' => { 'title' => 'Dummy Widget', 'color' => 'red' },
        'custom' => { 'custom_key' => 'custom_value' },
        'hidden' => true,
        'isCanvas' => true,
        'displayName' => 'Dummy'
      )
    end

    it 'accepts both type and resolved_name to define the node type' do
      id = state.add_node(type: 'div')
      expect(json.dig(id, 'type')).to eq('div')

      id = state.add_node(resolved_name: 'DummyWidget')
      expect(json.dig(id, 'type')).to eq('resolvedName' => 'DummyWidget')
    end

    it 'fails if type and resolved_name parameters are both missing' do
      expect { state.add_node }
        .to raise_error(ArgumentError, 'Must provide either `type` or `resolved_name`')
    end

    it 'fails if type and resolved_name parameters are both present' do
      expect { state.add_node(type: 'div', resolved_name: 'DummyWidget') }
        .to raise_error(ArgumentError, 'Cannot provide both `type` and `resolved_name`')
    end

    it 'fails if the parent node does not exist' do
      expect { state.add_node(type: 'div', parent: 'imaginary') }
        .to raise_error(KeyError)
    end

    it 'inserts a node at the specified position among siblings' do
      parent_id = state.add_node(resolved_name: 'Parent')

      id1 = state.add_node(resolved_name: 'DummyWidget', parent: parent_id)
      id2 = state.add_node(resolved_name: 'DummyWidget', parent: parent_id, index: 0)
      id3 = state.add_node(resolved_name: 'DummyWidget', parent: parent_id, index: -2)

      expect(json.dig(parent_id, 'nodes')).to eq [id2, id3, id1]
    end
  end

  describe '#node' do
    it 'returns the node with the given id' do
      expect(state.node('3h-Eizw2cD')).to be(json['3h-Eizw2cD'])
    end

    it 'fails if the node does not exist' do
      expect { state.node('non-existent') }.to raise_error(KeyError)
    end
  end

  describe '#nodes_by_resolved_name' do
    it 'returns all nodes with the given resolved_name' do
      nodes = state.nodes_by_resolved_name('TextMultiloc')

      expect(nodes.keys).to match_array %w[dpDtvSimWx x8jJUeZx0K]

      # Testing for object identity
      expect(nodes['dpDtvSimWx']).to be(json['dpDtvSimWx'])
      expect(nodes['x8jJUeZx0K']).to be(json['x8jJUeZx0K'])
    end

    it 'returns an empty hash if no nodes have the given resolved_name' do
      expect(state.nodes_by_resolved_name('non-existent')).to eq({})
    end
  end
end
