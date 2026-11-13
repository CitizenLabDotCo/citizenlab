# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::SystemPrompt do
  subject(:prompt) { described_class.new(locale: 'en', client: client) }

  let(:client) { instance_double(ContentBuilder::CustomBlocks::RendererClient) }

  it 'describes the SDK from the declarations the typechecker uses' do
    allow(client).to receive(:sdk_declarations).and_return("declare module 'gv-sdk' { export const Box: unknown; }")

    expect(prompt.text).to include "declare module 'gv-sdk'"
    expect(prompt.text).not_to include 'cannot be read right now'
  end

  it 'says so, rather than describing the SDK from memory, when the declarations cannot be read' do
    allow(client).to receive(:sdk_declarations)
      .and_raise(ContentBuilder::CustomBlocks::RendererClient::Unavailable, 'down')

    expect(prompt.text).to include 'cannot be read right now'
  end

  # A chartless report reads as a model that chose not to draw any, so a renderer we
  # cannot reach has to reach us some other way than a transcript.
  it 'reports a renderer it cannot reach' do
    error = ContentBuilder::CustomBlocks::RendererClient::Unavailable.new('down')
    allow(client).to receive(:sdk_declarations).and_raise(error)
    allow(ErrorReporter).to receive(:report)

    prompt.text

    expect(ErrorReporter).to have_received(:report).with(error)
  end

  describe 'the skill' do
    before { allow(client).to receive(:sdk_declarations).and_return('') }

    it 'is left out outside development, where our own editorial advice applies' do
      text = prompt.text

      expect(text).not_to include('<skill')
      expect(text).to include(
        'The reader is a resident or a councillor',
        '4. Taking part.',
        'Keep the prose under about 500 words',
        '## Choosing the chart',
        '6 to 10 printed pages'
      )
    end

    it 'replaces our editorial advice in development, and comes after our instructions so they win on a conflict' do
      stub_const('AIAssistant::Skill::ROOT', Rails.root.join('spec/fixtures/llm_skills/plugins'))
      # The report skill is private, so the example skill stands in for it.
      example_skill = AIAssistant::Skill.find('example-skill')
      allow(AIAssistant::Skill).to receive(:available?).and_return(true)
      allow(AIAssistant::Skill).to receive(:find).with('project-report').and_return(example_skill)

      text = prompt.text

      expect(text).to include('<skill name="example-skill">', 'Fixture guidance from the example skill.')
      expect(text.index('<skill')).to be > text.index('## The platform')
      expect(text).not_to include(
        'The reader is a resident or a councillor',
        '4. Taking part.',
        'Keep the prose under about 500 words',
        '## Choosing the chart',
        '6 to 10 printed pages'
      )
      expect(text).to include('1. Cover.', 'Divider with variant', '## The report is printed', '## Writing the query')
    end
  end

  # The typechecker is strict, and an example the model copies that does not pass it is
  # a failed first attempt in every run.
  describe 'the golden examples' do
    it 'are both in the prompt' do
      allow(client).to receive(:sdk_declarations).and_return('')

      expect(prompt.text).to include described_class::EXAMPLE_BAR_CHART
      expect(prompt.text).to include described_class::EXAMPLE_LINE_CHART
    end

    it 'type the props and every callback parameter' do
      [described_class::EXAMPLE_BAR_CHART, described_class::EXAMPLE_LINE_CHART].each do |source|
        expect(source).to include 'BlockProps<Config>'
        expect(source).not_to match(/\(\s*entry\s*\)\s*=>/)
      end
    end
  end
end
