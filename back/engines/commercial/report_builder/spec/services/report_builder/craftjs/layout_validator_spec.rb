# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Craftjs::LayoutValidator do
  # Mirrors the node shape the report builder actually stores.
  def node(resolved_name, parent:, props: {}, nodes: [])
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => nodes,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => false,
      'displayName' => resolved_name,
      'linkedNodes' => {}
    }
  end

  def root(child_ids)
    {
      'type' => 'div',
      'nodes' => child_ids,
      'props' => { 'id' => 'e2e-content-builder-frame' },
      'custom' => {},
      'hidden' => false,
      'isCanvas' => true,
      'displayName' => 'div',
      'linkedNodes' => {}
    }
  end

  let(:text_node) { node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } }) }
  let(:valid_graph) { { 'ROOT' => root(['textnode01']), 'textnode01' => text_node } }

  it 'accepts a graph of report widgets under a report ROOT' do
    result = described_class.validate(valid_graph)

    expect(result).to be_valid
    expect(result.message).to be_nil
  end

  it 'rejects a widget that is not a report widget' do
    graph = valid_graph.merge('badnode001' => node('PhasesWidget', parent: 'ROOT'))
    graph['ROOT'] = root(%w[textnode01 badnode001])

    result = described_class.validate(graph)

    expect(result).not_to be_valid
    expect(result.message).to include 'PhasesWidget'
  end

  it 'rejects a prop value outside the widget enum and points at that widget' do
    graph = valid_graph.merge(
      'spacenode1' => node('WhiteSpace', parent: 'ROOT', props: { 'size' => 'enormous' })
    )
    graph['ROOT'] = root(%w[textnode01 spacenode1])

    result = described_class.validate(graph)

    expect(result).not_to be_valid
    expect(result.message).to include 'enormous'
    expect(result.message).to include ReportBuilder::Craftjs::LayoutWidgets::DOCS['WhiteSpace']
  end

  it 'always includes the format rules, so a failure is correctable on its own' do
    result = described_class.validate(valid_graph.merge('ROOT' => root(%w[textnode01 missing001])))

    expect(result).not_to be_valid
    expect(result.message).to include ReportBuilder::Craftjs::LayoutWidgets::FORMAT_RULES
  end

  it 'rejects a layout that is not an object at all' do
    result = described_class.validate(['a node'])

    expect(result).not_to be_valid
    expect(result.message).to include ReportBuilder::Craftjs::LayoutWidgets::FORMAT_RULES
  end

  it 'rejects a graph above the node ceiling' do
    oversized = (1..(described_class::MAX_NODES + 1)).to_h do |index|
      ["node#{index.to_s.rjust(6, '0')}", text_node]
    end

    result = described_class.validate(oversized)

    expect(result).not_to be_valid
    expect(result.message).to include described_class::MAX_NODES.to_s
  end

  it 'checks widget conventions only within the given scope' do
    graph = valid_graph.merge(
      'spacenode1' => node('WhiteSpace', parent: 'ROOT', props: { 'size' => 'enormous' })
    )
    graph['ROOT'] = root(%w[textnode01 spacenode1])

    expect(described_class.validate(graph, convention_scope: ['textnode01'])).to be_valid
    expect(described_class.validate(graph, convention_scope: ['spacenode1'])).not_to be_valid
  end
end
