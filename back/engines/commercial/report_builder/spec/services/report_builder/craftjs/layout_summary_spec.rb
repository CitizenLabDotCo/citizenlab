# frozen_string_literal: true

require 'rails_helper'

# The model reads this back after every patch and decides what to change from it,
# so the id, the widget name and the snippet all have to survive.
describe ReportBuilder::Craftjs::LayoutSummary do
  def node(resolved_name, parent:, props: {}, nodes: [], canvas: false)
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => nodes,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => canvas,
      'displayName' => resolved_name,
      'linkedNodes' => {}
    }
  end

  let(:graph) do
    {
      'ROOT' => {
        'type' => 'div', 'nodes' => %w[cover col], 'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
      },
      'cover' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<h2>Turnout</h2>' } }),
      'col' => node('TwoColumn', parent: 'ROOT', props: { 'columnLayout' => '1-1' })
        .merge('linkedNodes' => { 'left' => 'leftcol' }),
      'leftcol' => node('Container', parent: 'col', nodes: ['inner'], canvas: true),
      'inner' => node('TextMultiloc', parent: 'leftcol', props: { 'text' => { 'en' => '<p>Inner</p>' } })
    }
  end

  it 'names every node by id and widget, in reading order' do
    lines = described_class.text(graph).lines.map(&:chomp)

    expect(lines.map { |line| line.strip.split.first })
      .to eq %w[ROOT cover col leftcol inner]
    expect(lines[1]).to include 'TextMultiloc'
  end

  it 'indents two spaces per level, so nesting is readable' do
    lines = described_class.text(graph).lines.map(&:chomp)

    expect(lines[0]).to start_with 'ROOT'
    expect(lines[1]).to start_with '  cover'
    expect(lines[3]).to start_with '    leftcol'
    expect(lines[4]).to start_with '      inner'
  end

  it 'appends the text of a node that has some, and nothing for one that has none' do
    lines = described_class.text(graph).lines.map(&:chomp)

    expect(lines[1]).to include '— Turnout'
    expect(lines[2]).not_to include '—'
  end

  it 'is empty for an empty graph rather than raising' do
    expect(described_class.text({})).to eq ''
  end
end
