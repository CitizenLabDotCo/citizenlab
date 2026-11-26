# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::LayoutTranslator do
  subject(:layout_translator) { described_class.new(locale: 'en', translator: translator) }

  let(:translator) do
    instance_double(ReportBuilder::Composition::Translator).tap do |double|
      allow(double).to receive(:call) do |texts|
        texts.transform_values { |text| { 'en' => text, 'nl-BE' => "NL #{text}" } }
      end
    end
  end

  let(:graph) do
    {
      'ROOT' => { 'type' => 'div', 'nodes' => %w[text chart] },
      'text' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'props' => { 'text' => { 'en' => '<p>One idea was submitted.</p>' } }
      },
      'chart' => {
        'type' => { 'resolvedName' => 'CustomBlock' },
        'props' => {
          'blockId' => 'd9f0c3e2-0000-0000-0000-000000000000',
          'version' => 1,
          'config' => { 'title' => { 'en' => 'Participation over time' } }
        }
      }
    }
  end

  it 'fills in the other locales for the text a reader sees' do
    layout_translator.call(graph)

    expect(graph.dig('text', 'props', 'text')).to eq(
      'en' => '<p>One idea was submitted.</p>',
      'nl-BE' => 'NL <p>One idea was submitted.</p>'
    )
  end

  # Chart settings are multilocs too, and an admin editing the chart afterwards sees
  # them in the panel in their own language.
  it 'reaches a multiloc nested in a widget config' do
    layout_translator.call(graph)

    expect(graph.dig('chart', 'props', 'config', 'title'))
      .to eq('en' => 'Participation over time', 'nl-BE' => 'NL Participation over time')
  end

  it 'leaves the props that are not text alone' do
    layout_translator.call(graph)

    expect(graph.dig('chart', 'props', 'version')).to eq 1
    expect(graph.dig('ROOT', 'nodes')).to eq %w[text chart]
  end

  it 'asks for nothing when the layout has no text' do
    empty = { 'ROOT' => { 'type' => 'div', 'nodes' => [] } }

    expect(layout_translator.call(empty)).to eq empty
    expect(translator).not_to have_received(:call)
  end
end
