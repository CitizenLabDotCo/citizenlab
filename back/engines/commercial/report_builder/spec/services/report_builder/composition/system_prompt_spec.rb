# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::SystemPrompt do
  subject(:prompt) { described_class.new(locale: 'en', client: client) }

  let(:client) { instance_double(ContentBuilder::CustomBlocks::CheckServiceClient) }

  it 'describes the SDK from the declarations the typechecker uses' do
    allow(client).to receive(:sdk_declarations).and_return("declare module 'gv-sdk' { export const Box: unknown; }")

    expect(prompt.text).to include "declare module 'gv-sdk'"
    expect(prompt.text).not_to include 'cannot be read right now'
  end

  it 'says so, rather than describing the SDK from memory, when the declarations cannot be read' do
    allow(client).to receive(:sdk_declarations)
      .and_raise(ContentBuilder::CustomBlocks::CheckServiceClient::Unavailable, 'down')

    expect(prompt.text).to include 'cannot be read right now'
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
