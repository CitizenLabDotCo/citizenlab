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

  # A run reads the reported project's rows only, whoever it is for, so the prompt
  # describes what such a query can read and nothing it would be refused.
  describe 'the reporting views' do
    before { allow(client).to receive(:sdk_declarations).and_return('') }

    it 'describes the views a project report may read, the platform baselines among them' do
      expect(prompt.text).to include "reporting_contributions: #{Analytics::Reporting::Contribution.table_description}"
      expect(prompt.text).to include "reporting_platform_baselines: #{Analytics::Reporting::PlatformBaseline.table_description}"
    end

    it 'leaves out the admin-only views' do
      admin_only = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.select(&:admin_only?)

      expect(admin_only).not_to be_empty
      expect(prompt.text).not_to include(*admin_only.map(&:table_name))
    end

    it 'points comparisons with the platform at the baselines view' do
      expect(prompt.text).to include 'For a comparison with the rest of the platform'
      expect(prompt.text).not_to include 'deliberately about the'
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
