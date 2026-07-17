# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::Validator do
  subject(:errors) do
    error_objects.map(&:to_s)
  end

  let(:error_objects) do
    described_class.new(json, widget_specs: widget_specs, convention_scope: convention_scope).errors
  end

  let(:widget_specs) { nil }
  let(:convention_scope) { nil }

  def load_fixture(file_name)
    Pathname.new(File.dirname(__FILE__)).join('fixtures', file_name).read
  end

  def text_node(parent:, text: { 'en' => '<p>Hi</p>' }, **overrides)
    craftjs_node('TextMultiloc', parent: parent, props: { 'text' => text }, **overrides)
  end

  context 'structural checks (no widget_specs)' do
    let(:json) do
      {
        'ROOT' => craftjs_root(['A']),
        'A' => text_node(parent: 'ROOT')
      }
    end

    it 'is empty for a well-formed graph' do
      expect(errors).to eq([])
    end

    it 'is empty for the rich example description fixture' do
      fixture = JSON.parse(load_fixture('example_description_craftjs.json'))

      expect(described_class.new(fixture).errors).to eq([])
    end

    it 'flags a non-hash document' do
      expect(described_class.new('not a hash').errors.map(&:to_s)).to eq(['craftjs_json must be a JSON object'])
    end

    it 'flags a missing ROOT node' do
      expect(described_class.new({}).errors.map(&:to_s)).to eq(['ROOT node is missing'])
    end

    it 'flags a node missing the nodes key' do
      json['A'].delete('nodes')

      expect(errors).to eq(["node A: 'nodes' must be a array"])
    end

    it "flags a ROOT node that has a 'parent'" do
      json['ROOT']['parent'] = 'A'

      expect(errors).to include("node ROOT: must not have a 'parent'")
    end

    it 'flags a node referencing ROOT as a nodes child (cycle back to the document root)' do
      json['A']['nodes'] = ['ROOT']

      expect(errors).to include('node A: must not reference ROOT as a nodes child')
    end

    it 'flags a node referencing ROOT through a linkedNodes slot' do
      json['A']['linkedNodes'] = { 'content' => 'ROOT' }

      expect(errors).to include('node A: must not reference ROOT as a linkedNodes[content] child')
    end

    it 'flags a child id referenced but absent from the graph' do
      json['ROOT']['nodes'] = %w[A ghost]

      expect(errors).to eq(["node ROOT: nodes references missing node 'ghost'"])
    end

    it "flags a child whose 'parent' does not match the referencing node" do
      json['A']['parent'] = 'somewhere-else'

      expect(errors).to eq(
        ["node A: 'parent' is 'somewhere-else' but the node is a nodes child of 'ROOT'"]
      )
    end

    it 'flags an orphan node (present in the map, referenced by nobody)' do
      json['B'] = text_node(parent: 'ROOT')
      # NOTE: not added to ROOT['nodes'], so it's both unreferenced and unreachable.

      expect(errors).to include("node B: not referenced by any parent's 'nodes' or 'linkedNodes'")
    end

    it 'flags a node referenced by two parents' do
      json['ROOT']['nodes'] = %w[A B]
      json['A'] = text_node(parent: 'ROOT', isCanvas: true, nodes: ['B'])
      json['B'] = text_node(parent: 'ROOT')

      expect(errors).to include('node B: referenced by 2 parents; every node must have exactly one')
    end

    it 'flags nodes in an unreachable cycle' do
      json['X'] = text_node(parent: 'Y', isCanvas: true, nodes: ['Y'])
      json['Y'] = text_node(parent: 'X', isCanvas: true, nodes: ['X'])

      expect(errors).to contain_exactly(
        'node X: not reachable from ROOT',
        'node Y: not reachable from ROOT'
      )
    end

    it 'accepts children under a non-canvas node (legacy TwoColumn graphs store columns this way)' do
      json['A']['nodes'] = ['C']
      json['C'] = text_node(parent: 'A')

      expect(errors).to be_empty
    end
  end

  context 'error objects' do
    let(:json) do
      {
        'ROOT' => craftjs_root(['A']),
        'A' => text_node(parent: 'elsewhere')
      }
    end

    it 'carry the offending node id and a machine-readable code' do
      expect(error_objects).to contain_exactly(
        have_attributes(node_id: 'A', code: :parent_mismatch)
      )
    end

    it 'uses a nil node id for document-level problems' do
      expect(described_class.new('not a hash').errors).to contain_exactly(
        have_attributes(node_id: nil, code: :not_an_object)
      )
    end
  end

  context 'convention checks (with widget_specs)' do
    let(:widget_specs) do
      {
        'TextMultiloc' => { 'multilocs' => %w[text] },
        'ButtonMultiloc' => {
          'multilocs' => %w[text],
          'enums' => { 'type' => %w[primary secondary] }
        },
        'TwoColumn' => { 'slots' => %w[left right] },
        'Container' => {}
      }
    end

    let(:json) do
      {
        'ROOT' => craftjs_root(['T']),
        'T' => text_node(parent: 'ROOT')
      }
    end

    it 'is empty for a graph that follows every convention' do
      expect(errors).to eq([])
    end

    it 'rejects an empty-string node id' do
      json['ROOT']['nodes'] = ['T', '']
      json[''] = text_node(parent: 'ROOT')

      expect(errors).to contain_exactly(
        match(/\Anode "": node ids must be 1-64 characters/)
      )
    end

    it 'rejects a node id containing whitespace or newlines' do
      json['ROOT']['nodes'] = ['T', "bad id\n"]
      json["bad id\n"] = text_node(parent: 'ROOT')

      expect(errors).to contain_exactly(
        match(/node ids must be 1-64 characters/)
      )
    end

    it 'rejects undeclared node keys' do
      json['T']['clazz'] = 'zoomed'

      expect(errors).to contain_exactly(
        match(/\Anode T: unknown keys: clazz \(allowed:/)
      )
    end

    it 'rejects undeclared keys on ROOT' do
      json['ROOT']['theme'] = 'dark'

      expect(errors).to contain_exactly(
        match(/\Anode ROOT: unknown keys: theme \(allowed:/)
      )
    end

    it 'rejects an unsupported widget' do
      json['T']['type'] = { 'resolvedName' => 'UnknownWidget' }

      expect(errors).to contain_exactly(
        match(/\Anode T: widget 'UnknownWidget' is not supported/)
      )
    end

    it 'rejects an unknown linkedNodes slot' do
      json.delete('T')
      json['ROOT']['nodes'] = ['TC']
      json['TC'] = craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'top' => 'C' })
      json['C'] = craftjs_node('Container', parent: 'TC', isCanvas: true)

      expect(errors).to contain_exactly(
        match(/\Anode TC: unknown linkedNodes slot 'top'/)
      )
    end

    it 'rejects a linkedNodes slot container that is not a canvas' do
      json.delete('T')
      json['ROOT']['nodes'] = ['TC']
      json['TC'] = craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'left' => 'C' })
      json['C'] = craftjs_node('Container', parent: 'TC', isCanvas: false)

      expect(errors).to contain_exactly(
        match(/\Anode C: slot containers must be a canvas/)
      )
    end

    context 'when a patch flips a slot container to isCanvas: false without re-sending its parent' do
      let(:json) do
        {
          'ROOT' => craftjs_root(['TC']),
          'TC' => craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'left' => 'C' }),
          'C' => craftjs_node('Container', parent: 'TC', isCanvas: false)
        }
      end
      let(:convention_scope) { %w[C] }

      it 'still rejects the non-canvas slot container' do
        expect(errors).to contain_exactly(
          match(/\Anode C: slot containers must be a canvas/)
        )
      end
    end

    it 'rejects a prop value outside its enum' do
      json['ROOT']['nodes'] = ['B']
      json.delete('T')
      json['B'] = craftjs_node(
        'ButtonMultiloc',
        parent: 'ROOT',
        props: { 'text' => { 'en' => 'Click' }, 'type' => 'bogus' }
      )

      expect(errors).to contain_exactly(
        match(/\Anode B: props\.type is 'bogus' but must be one of/)
      )
    end

    it 'rejects a non-multiloc text prop' do
      json['T']['props']['text'] = 'plain string'

      expect(errors).to eq(
        ['node T: props.text must be a multiloc object mapping locales to strings']
      )
    end

    it 'accepts multiloc keys that are supported locales' do
      json['T']['props']['text'] = { 'en' => '<p>Hi</p>', 'fr-BE' => '<p>Salut</p>' }

      expect(errors).to eq([])
    end

    it 'rejects multiloc keys that are not supported locales' do
      json['T']['props']['text'] = { 'en' => '<p>Hi</p>', 'english' => '<p>Hi</p>' }

      expect(errors).to contain_exactly(
        match(/\Anode T: props\.text keys must be locales .*unknown: english/m)
      )
    end

    it "rejects a ROOT whose type is not 'div'" do
      json['ROOT']['type'] = 'span'

      expect(errors).to eq(["node ROOT: 'type' must be the string 'div'"])
    end

    it 'rejects a ROOT that is not a canvas' do
      json['ROOT']['isCanvas'] = false

      expect(errors).to eq(['node ROOT: must be a canvas (isCanvas: true)'])
    end

    context 'with a convention_scope' do
      let(:json) do
        {
          'ROOT' => craftjs_root(%w[T Z]),
          'T' => text_node(parent: 'ROOT'),
          'Z' => craftjs_node('Spotlight', parent: 'ROOT')
        }
      end

      context 'when the scope excludes the offending node' do
        let(:convention_scope) { %w[T] }

        it 'passes despite the unsupported widget elsewhere in the graph' do
          expect(errors).to eq([])
        end
      end

      context 'when the scope includes the offending node' do
        let(:convention_scope) { %w[T Z] }

        it 'rejects the unsupported widget' do
          expect(errors).to contain_exactly(
            match(/\Anode Z: widget 'Spotlight' is not supported/)
          )
        end
      end

      context 'when the scope is nil' do
        let(:convention_scope) { nil }

        it 'checks every node' do
          expect(errors).to contain_exactly(
            match(/\Anode Z: widget 'Spotlight' is not supported/)
          )
        end
      end
    end
  end
end
