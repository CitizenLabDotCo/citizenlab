# frozen_string_literal: true

require 'rails_helper'

# Guards against the widget registry, the validator rules and the LLM-facing
# cheatsheet drifting apart.
describe McpServer::Tools::LayoutWidgets do
  describe 'WIDGETS' do
    it 'documents every enum value (except the legacy empty string) in the widget doc' do
      described_class::WIDGETS.each do |name, widget|
        doc = widget['doc']
        next if doc.nil?

        enums = widget.dig('rules', 'enums') || {}
        enums.each do |prop, values|
          values.reject { |value| value == '' }.each do |value|
            expect(doc).to include(value),
              "expected the #{name} doc to mention #{prop} value '#{value}'"
          end
        end
      end
    end

    it 'documents every linkedNodes slot name in the widget doc' do
      described_class::WIDGETS.each do |name, widget|
        doc = widget['doc']
        next if doc.nil?

        (widget.dig('rules', 'slots') || []).each do |slot|
          expect(doc).to include(slot), "expected the #{name} doc to mention slot '#{slot}'"
        end
      end
    end
  end

  describe 'VALIDATOR_SPECS' do
    it 'covers exactly the widgets in WIDGETS' do
      expect(described_class::VALIDATOR_SPECS.keys).to match_array(described_class::WIDGETS.keys)
    end
  end

  describe 'SCAFFOLD_WIDGETS' do
    it 'are all registered widgets, without insertable docs' do
      described_class::SCAFFOLD_WIDGETS.each do |name|
        expect(described_class::WIDGETS).to have_key(name)
        expect(described_class::WIDGETS[name]['doc']).to be_nil,
          "scaffold widget #{name} must not be advertised as insertable"
      end
    end

    it 'matches the canonical nodes the backend seeds' do
      seeded = ContentBuilder::ProjectPageLayoutService.new
        .from_description_multiloc({})
        .values
        .map { |node| node.dig('type', 'resolvedName') }

      expect(seeded).to match_array(described_class::SCAFFOLD_WIDGETS)
    end
  end

  describe 'CHEATSHEET' do
    it 'includes the doc of every documented widget' do
      described_class::WIDGETS.each do |name, widget|
        next if widget['doc'].nil?

        expect(described_class::CHEATSHEET).to include(widget['doc']),
          "expected the cheatsheet to include the #{name} doc"
        expect(described_class::CHEATSHEET).to include(name)
      end
    end

    it 'documents every scaffold widget' do
      described_class::SCAFFOLD_WIDGETS.each do |name|
        expect(described_class::CHEATSHEET).to include(name)
      end
    end

    it 'is frozen' do
      expect(described_class::CHEATSHEET).to be_frozen
    end
  end
end
