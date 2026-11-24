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

  # A phase report starts from a template unless the admin empties it, so this is
  # the ordinary shape, not an edge case: ROOT -> PhaseTemplate -> a Box canvas
  # linked under it, holding every section.
  describe 'a report made from a template' do
    let(:template_graph) do
      {
        'ROOT' => root(['tpl']),
        'tpl' => node('PhaseTemplate', parent: 'ROOT').merge(
          'linkedNodes' => { 'phase-report-template' => 'box' }
        ),
        'box' => node('Box', parent: 'tpl', nodes: ['sec']).merge('isCanvas' => true),
        'sec' => node('TextMultiloc', parent: 'box', props: { 'text' => { 'en' => '<p>Turnout</p>' } })
      }
    end

    it 'validates as a whole' do
      expect(described_class.validate(template_graph)).to be_valid
    end

    # What chat has to do to add a section where the admin asked: send the Box with
    # its new child list. Before Box was a known widget this was refused outright.
    it 'accepts a section inserted into the template, which is what chat sends' do
      graph = template_graph.merge(
        'box' => template_graph['box'].merge('nodes' => %w[sec added]),
        'added' => node('TextMultiloc', parent: 'box', props: { 'text' => { 'en' => '<p>New</p>' } })
      )

      result = described_class.validate(graph, convention_scope: %w[box added])

      expect(result).to be_valid
    end
  end

  # A two-column section is stored two ways depending on who made it, and the widget
  # renders both. Chat sends the node back as it found it — to retitle a section,
  # say — so refusing either would cost a round for nothing.
  describe 'a two-column section, however it was wired' do
    def two_column_graph(**overrides)
      {
        'ROOT' => root(['col']),
        'col' => node('TwoColumn', parent: 'ROOT', props: { 'columnLayout' => '1-1' }).merge(overrides),
        'leftcol' => node('Container', parent: 'col').merge('isCanvas' => true),
        'rightcol' => node('Container', parent: 'col').merge('isCanvas' => true)
      }
    end

    it 'accepts the slots the builder and the composer write' do
      graph = two_column_graph('linkedNodes' => { 'left' => 'leftcol', 'right' => 'rightcol' })

      expect(described_class.validate(graph, convention_scope: ['col'])).to be_valid
    end

    it 'accepts the craft children most templates store' do
      graph = two_column_graph('nodes' => %w[leftcol rightcol])

      expect(described_class.validate(graph, convention_scope: ['col'])).to be_valid
    end

    # The widget looks up only the slots it declares, so differently named ones
    # draw two empty columns and strand what was wired to them.
    it 'refuses slots the widget does not declare' do
      graph = two_column_graph(
        'linkedNodes' => { 'column-visitors-left' => 'leftcol', 'column-visitors-right' => 'rightcol' }
      )

      expect(described_class.validate(graph, convention_scope: ['col'])).not_to be_valid
    end

    it 'refuses a section with one column linked and the other a craft child' do
      graph = two_column_graph('nodes' => %w[leftcol], 'linkedNodes' => { 'right' => 'rightcol' })

      expect(described_class.validate(graph, convention_scope: ['col'])).not_to be_valid
    end

    it 'still refuses a section with only one column' do
      graph = two_column_graph('nodes' => %w[leftcol]).except('rightcol')

      result = described_class.validate(graph, convention_scope: ['col'])

      expect(result).not_to be_valid
      expect(result.message).to include 'must hold 2 children'
    end
  end

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
