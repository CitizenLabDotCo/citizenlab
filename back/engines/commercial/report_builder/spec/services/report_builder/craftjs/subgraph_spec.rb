# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Craftjs::Subgraph do
  def node(name, parent:, nodes: [], linked: {})
    {
      'type' => { 'resolvedName' => name }, 'props' => {}, 'custom' => {}, 'hidden' => false,
      'isCanvas' => false, 'displayName' => name, 'parent' => parent, 'nodes' => nodes, 'linkedNodes' => linked
    }
  end

  let(:graph) do
    {
      'ROOT' => {
        'type' => 'div', 'isCanvas' => true, 'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {}, 'hidden' => false, 'nodes' => %w[intro section], 'linkedNodes' => {}, 'displayName' => 'div'
      },
      'intro' => node('TextMultiloc', parent: 'ROOT'),
      'section' => node('TwoColumn', parent: 'ROOT', linked: { 'left' => 'left', 'right' => 'right' }),
      'left' => node('Container', parent: 'section', nodes: ['chart']),
      'right' => node('Container', parent: 'section'),
      'chart' => node('CustomBlock', parent: 'left')
    }
  end

  it 'cuts out a node with everything inside it, hung under a fresh ROOT' do
    sub = described_class.extract(graph, 'section')

    expect(sub.keys).to match_array %w[ROOT section left right chart]
    expect(sub['ROOT']['nodes']).to eq ['section']
    expect(sub['ROOT']['props']).to eq('id' => 'e2e-content-builder-frame')
    expect(sub['section']['parent']).to eq 'ROOT'
    expect(sub['chart']['parent']).to eq 'left'
  end

  it 'leaves the original graph alone' do
    described_class.extract(graph, 'section')

    expect(graph['section']['parent']).to eq 'ROOT'
    expect(graph['ROOT']['nodes']).to eq %w[intro section]
  end

  it 'gives the whole graph back for ROOT' do
    expect(described_class.extract(graph, 'ROOT')).to equal graph
  end

  it 'is nil for a node that is not there' do
    expect(described_class.extract(graph, 'nope')).to be_nil
    expect(described_class.extract('not a graph', 'intro')).to be_nil
  end
end
