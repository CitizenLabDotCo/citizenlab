# frozen_string_literal: true

require 'rails_helper'

# Guards against the homepage widget rules (WidgetSpecs::HOMEPAGE_SPECS) and the LLM-facing
# docs drifting apart.
describe McpServer::HomepageWidgets do
  let(:specs) { ContentBuilder::Craftjs::WidgetSpecs::HOMEPAGE_SPECS }
  # Structural containers carry no insertable docs (they fill slots, like on project pages).
  let(:structural) { %w[Container Box] }

  describe 'DOCS' do
    it 'documents only widgets that exist in the homepage specs' do
      expect(described_class::DOCS.keys - specs.keys).to be_empty
    end

    it 'covers every homepage spec via its own or the shared project docs, minus structural containers' do
      documented = described_class::ALL_DOCS.keys + structural

      expect(specs.keys - documented).to be_empty
    end

    it 'documents every static enum value' do
      described_class::DOCS.each do |name, doc|
        (specs.dig(name, 'enums') || {}).each_value do |values|
          values.compact_blank.each { |value| expect(doc).to include(value) }
        end
      end
    end
  end

  describe '.protected?' do
    it 'protects the banner by type and any node marked custom.noDelete' do
      banner = { 'type' => { 'resolvedName' => 'HomepageBanner' } }
      expect(described_class.protected?(banner)).to be(true)
      expect(described_class.protected?({ 'custom' => { 'noDelete' => true } })).to be(true)
      expect(described_class.protected?({ 'type' => { 'resolvedName' => 'Projects' }, 'custom' => {} })).to be(false)
      expect(described_class.protected?({})).to be(false)
      expect(described_class.protected?(nil)).to be(false)
    end
  end

  describe '.reference_for' do
    it 'includes the format rules, homepage docs and reused shared docs' do
      reference = described_class.reference_for(%w[HomepageBanner TextMultiloc])

      expect(reference).to include(described_class::FORMAT_RULES)
      expect(reference).to include(described_class::DOCS['HomepageBanner'])
      expect(reference).to include(McpServer::LayoutWidgets::DOCS['TextMultiloc'])
    end
  end

  describe 'FORMAT_RULES' do
    it 'names the fixed homepage banner' do
      expect(described_class::FORMAT_RULES).to include('HomepageBanner')
    end
  end
end
