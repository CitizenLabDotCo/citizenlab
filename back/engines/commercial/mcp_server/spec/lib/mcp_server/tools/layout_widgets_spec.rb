# frozen_string_literal: true

require 'rails_helper'

# Guards against the widget rules (ContentBuilder::Craftjs::WidgetSpecs), the
# LLM-facing docs and the cheatsheet drifting apart.
describe McpServer::Tools::LayoutWidgets do
  describe 'DOCS' do
    it 'documents only widgets that exist in the widget specs' do
      undeclared = described_class::DOCS.keys - ContentBuilder::Craftjs::WidgetSpecs::SPECS.keys

      expect(undeclared).to be_empty
    end

    it 'documents every enum value (except the legacy empty string) in the widget doc' do
      described_class::DOCS.each do |name, doc|
        enums = ContentBuilder::Craftjs::WidgetSpecs::SPECS.dig(name, 'enums') || {}
        enums.each do |prop, values|
          values.reject { |value| value == '' }.each do |value|
            expect(doc).to include(value),
              "expected the #{name} doc to mention #{prop} value '#{value}'"
          end
        end
      end
    end

    it 'documents every linkedNodes slot name in the widget doc' do
      described_class::DOCS.each do |name, doc|
        slots = ContentBuilder::Craftjs::WidgetSpecs::SPECS.dig(name, 'slots') || []
        slots.each do |slot|
          expect(doc).to include(slot), "expected the #{name} doc to mention slot '#{slot}'"
        end
      end
    end
  end

  describe 'CHEATSHEET' do
    it 'includes the doc of every documented widget' do
      described_class::DOCS.each do |name, doc|
        expect(described_class::CHEATSHEET).to include(doc),
          "expected the cheatsheet to include the #{name} doc"
        expect(described_class::CHEATSHEET).to include(name)
      end
    end

    it 'is frozen' do
      expect(described_class::CHEATSHEET).to be_frozen
    end
  end
end
