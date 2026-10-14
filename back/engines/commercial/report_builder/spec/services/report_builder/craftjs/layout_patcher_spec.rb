# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Craftjs::LayoutPatcher do
  def node(name, props = {}, parent: 'ROOT', children: [])
    {
      'type' => { 'resolvedName' => name }, 'nodes' => children, 'props' => props,
      'custom' => {}, 'hidden' => false, 'parent' => parent, 'isCanvas' => false,
      'displayName' => name, 'linkedNodes' => {}
    }
  end

  def root(*child_ids)
    {
      'type' => 'div', 'nodes' => child_ids, 'props' => { 'id' => 'e2e-content-builder-frame' },
      'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
    }
  end

  let(:graph) do
    {
      'ROOT' => root('textnode01', 'textnode02'),
      'textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<p>One</p>' } }),
      'textnode02' => node('TextMultiloc', { 'text' => { 'en' => '<p>Two</p>' } })
    }
  end

  describe '.patch' do
    it 'merges the patch into what is already there' do
      result = described_class.patch(
        graph,
        nodes: { 'ROOT' => root('textnode01', 'textnode02', 'textnode03'),
                 'textnode03' => node('TextMultiloc', { 'text' => { 'en' => '<p>Three</p>' } }) }
      )

      expect(result.keys).to contain_exactly('ROOT', 'textnode01', 'textnode02', 'textnode03')
    end

    # The one node whose type is a plain string. A model that writes it like every other
    # node meant the same thing; refusing a 50-node patch over it costs the patch twice.
    it 'reads a ROOT written the widget way as the plain "div" it is' do
      result = described_class.patch(
        {}, nodes: { 'ROOT' => root('textnode01').merge('type' => { 'resolvedName' => 'div' }),
                     'textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<p>One</p>' } }) }
      )

      expect(result['ROOT']['type']).to eq 'div'
    end

    it 'leaves a ROOT that resolves to something else for the validator to refuse' do
      result = described_class.patch({}, nodes: { 'ROOT' => root.merge('type' => { 'resolvedName' => 'Box' }) })

      expect(result['ROOT']['type']).to eq('resolvedName' => 'Box')
    end

    # The whole point: a node the model did not send comes back untouched, so it never
    # has to re-emit the report to add to it.
    it 'leaves nodes the patch did not mention exactly as they were' do
      result = described_class.patch(
        graph, nodes: { 'textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<p>Edited</p>' } }) }
      )

      expect(result['textnode02']).to eq graph['textnode02']
      expect(result['textnode01']['props']['text']['en']).to eq '<p>Edited</p>'
    end

    it 'does not touch the graph it was given' do
      described_class.patch(graph, nodes: { 'textnode01' => node('TextMultiloc', { 'text' => {} }) })

      expect(graph['textnode01']['props']['text']['en']).to eq '<p>One</p>'
    end

    it 'removes a node and detaches it from its parent' do
      result = described_class.patch(graph, nodes: {}, delete_node_ids: ['textnode02'])

      expect(result).not_to have_key 'textnode02'
      expect(result['ROOT']['nodes']).to eq ['textnode01']
    end

    it 'takes a subtree with the node it removes' do
      nested = graph.merge(
        'containr001' => node('Container', {}, children: ['textnode09']).merge('isCanvas' => true),
        'textnode09' => node('TextMultiloc', { 'text' => {} }, parent: 'containr001')
      )
      nested['ROOT'] = root('textnode01', 'textnode02', 'containr001')

      result = described_class.patch(nested, nodes: {}, delete_node_ids: ['containr001'])

      expect(result).not_to have_key 'containr001'
      expect(result).not_to have_key 'textnode09'
    end

    it 'refuses a patch that both writes and deletes the same node' do
      expect do
        described_class.patch(
          graph, nodes: { 'textnode02' => node('TextMultiloc', {}) }, delete_node_ids: ['textnode02']
        )
      end.to raise_error described_class::PatchError, /both delete_node_ids and nodes/
    end

    it 'refuses to delete something that is not there' do
      expect { described_class.patch(graph, nodes: {}, delete_node_ids: ['nosuchnode']) }
        .to raise_error described_class::PatchError, /not in the report/
    end

    it 'refuses an empty patch, which is a call the model wasted' do
      expect { described_class.patch(graph, nodes: {}) }
        .to raise_error described_class::PatchError, /needs either nodes/
    end

    it 'accepts a first patch against an empty report' do
      result = described_class.patch({}, nodes: { 'ROOT' => root })

      expect(result.keys).to eq ['ROOT']
    end
  end
end
