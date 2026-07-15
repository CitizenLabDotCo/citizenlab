# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Serializers::LayoutOutline do
  subject(:entries) { described_class.new(json).entries }

  def text_node(parent:, text:, **overrides)
    craftjs_node('TextMultiloc', parent: parent, props: { 'text' => { 'en' => text } }, **overrides)
  end

  def container(parent:, nodes: [])
    craftjs_node('Container', parent: parent, isCanvas: true, nodes: nodes)
  end

  describe 'visual order' do
    context 'with a TwoColumn whose linkedNodes hash lists right before left' do
      let(:json) do
        {
          'ROOT' => craftjs_root(%w[TC]),
          'TC' => craftjs_node(
            'TwoColumn', parent: 'ROOT', linkedNodes: { 'right' => 'CR', 'left' => 'CL' }
          ),
          'CL' => container(parent: 'TC', nodes: %w[TL]),
          'TL' => text_node(parent: 'CL', text: '<p>Left</p>'),
          'CR' => container(parent: 'TC', nodes: %w[TR]),
          'TR' => text_node(parent: 'CR', text: '<p>Right</p>')
        }
      end

      it 'walks the left column before the right one' do
        expect(entries.pluck(:id)).to eq(%w[ROOT TC CL TL CR TR])
      end

      it 'labels the columns with their slot names' do
        slots = entries.to_h { |entry| [entry[:id], entry[:slot]] }
        expect(slots).to include('CL' => 'left', 'CR' => 'right')
      end

      it 'assigns depths along the walk' do
        depths = entries.to_h { |entry| [entry[:id], entry[:depth]] }
        expect(depths).to eq('ROOT' => 0, 'TC' => 1, 'CL' => 2, 'TL' => 3, 'CR' => 2, 'TR' => 3)
      end

      it 'marks canvases with canvas: true and omits the key elsewhere' do
        by_id = entries.index_by { |entry| entry[:id] }
        expect(by_id['ROOT'][:canvas]).to be(true)
        expect(by_id['CL'][:canvas]).to be(true)
        expect(by_id['TC']).not_to have_key(:canvas)
        expect(by_id['TL']).not_to have_key(:canvas)
      end

      it 'omits parent on ROOT and sets it everywhere else' do
        by_id = entries.index_by { |entry| entry[:id] }
        expect(by_id['ROOT']).not_to have_key(:parent)
        expect(by_id['TL'][:parent]).to eq('CL')
      end

      it 'marks custom.locked and custom.region nodes with locked: true and omits the key elsewhere' do
        json['TC']['custom'] = { 'locked' => true }
        json['CL']['custom'] = { 'region' => true }

        locked = entries.to_h { |entry| [entry[:id], entry[:locked]] }
        expect(locked).to include('TC' => true, 'CL' => true, 'TL' => nil, 'ROOT' => nil)
      end

      it 'omits slot on nodes that are ordinary children' do
        by_id = entries.index_by { |entry| entry[:id] }
        expect(by_id['TL']).not_to have_key(:slot)
      end
    end

    context 'with a ThreeColumn whose linkedNodes hash is scrambled' do
      let(:json) do
        {
          'ROOT' => craftjs_root(%w[THREE]),
          'THREE' => craftjs_node(
            'ThreeColumn',
            parent: 'ROOT',
            linkedNodes: { 'column3' => 'C3', 'column1' => 'C1', 'column2' => 'C2' }
          ),
          'C1' => container(parent: 'THREE'),
          'C2' => container(parent: 'THREE'),
          'C3' => container(parent: 'THREE')
        }
      end

      it 'walks the columns in visual order' do
        expect(entries.pluck(:id)).to eq(%w[ROOT THREE C1 C2 C3])
        expect(entries.last(3).pluck(:slot)).to eq(%w[column1 column2 column3])
      end
    end
  end

  describe 'text snippets' do
    let(:json) do
      {
        'ROOT' => craftjs_root(%w[T]),
        'T' => text_node(parent: 'ROOT', text: '<p>Hello <strong>world</strong></p>')
      }
    end

    it 'strips HTML tags' do
      expect(entries.last[:text]).to eq('Hello world')
    end

    it 'truncates snippets longer than 120 characters' do
      json['T']['props']['text']['en'] = "<p>#{'long words ' * 30}</p>"

      snippet = entries.last[:text]
      expect(snippet.length).to eq(120)
      expect(snippet).to end_with('...')
    end

    it 'falls back to the title prop when there is no text' do
      json['T']['props'] = { 'title' => { 'en' => 'FAQ title' } }

      expect(entries.last[:text]).to eq('FAQ title')
    end

    it 'omits the text key when the node has neither text nor title' do
      json['T']['props'] = {}

      expect(entries.last).not_to have_key(:text)
    end
  end

  describe 'tolerance of unvalidated graphs' do
    it 'handles nodes missing the linkedNodes and nodes keys' do
      json = {
        'ROOT' => craftjs_root(%w[T]),
        'T' => text_node(parent: 'ROOT', text: '<p>Hi</p>').except('linkedNodes', 'nodes')
      }

      expect(described_class.new(json).entries.pluck(:id)).to eq(%w[ROOT T])
    end

    it 'omits the text key for non-string multiloc values instead of crashing' do
      json = {
        'ROOT' => craftjs_root(%w[T]),
        'T' => craftjs_node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => 123 } })
      }

      entry = described_class.new(json).entries.last
      expect(entry[:id]).to eq('T')
      expect(entry).not_to have_key(:text)
    end

    it 'handles props that are not a hash' do
      json = {
        'ROOT' => craftjs_root(%w[T]),
        'T' => craftjs_node('TextMultiloc', parent: 'ROOT', props: 'bogus')
      }

      expect(described_class.new(json).entries.pluck(:id)).to eq(%w[ROOT T])
    end

    it 'terminates on a cyclic graph and lists each node once' do
      json = {
        'ROOT' => craftjs_root(%w[A]),
        'A' => craftjs_node('Container', parent: 'ROOT', isCanvas: true, nodes: %w[B]),
        'B' => craftjs_node('Container', parent: 'A', isCanvas: true, nodes: %w[A])
      }

      ids = described_class.new(json).entries.pluck(:id)
      expect(ids).to eq(%w[ROOT A B])
    end

    it "appends children missing from their parent's nodes array" do
      json = {
        'ROOT' => craftjs_root(%w[T1]),
        'T1' => text_node(parent: 'ROOT', text: '<p>Listed</p>'),
        'X' => text_node(parent: 'ROOT', text: '<p>Unlisted</p>')
      }

      expect(described_class.new(json).entries.pluck(:id)).to eq(%w[ROOT T1 X])
    end
  end
end
