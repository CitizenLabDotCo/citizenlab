# frozen_string_literal: true

require 'rails_helper'

# Guards against the widget rules (ContentBuilder::Craftjs::WidgetSpecs) and the
# LLM-facing docs drifting apart.
describe McpServer::LayoutWidgets do
  let(:scaffold_widgets) { ContentBuilder::ProjectPageLayoutService::SCAFFOLD_WIDGETS }

  describe 'DOCS' do
    it 'documents only widgets that exist in the widget specs' do
      undeclared = described_class::DOCS.keys - ContentBuilder::Craftjs::WidgetSpecs::SPECS.keys

      expect(undeclared).to be_empty
    end

    it 'partitions the widget specs exactly into documented, scaffold and explicitly undocumented widgets' do
      covered = described_class::DOCS.keys + scaffold_widgets + described_class::UNDOCUMENTED_WIDGETS

      expect(covered).to match_array(ContentBuilder::Craftjs::WidgetSpecs::SPECS.keys)
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

  describe '.reference_for' do
    it 'includes the format rules and only the requested widget docs' do
      reference = described_class.reference_for(%w[TextMultiloc TextMultiloc])

      expect(reference).to include(described_class::FORMAT_RULES)
      expect(reference).to include(described_class::DOCS['TextMultiloc'])
      expect(reference).not_to include(described_class::DOCS['TwoColumn'])
    end

    it 'ignores widgets without a doc' do
      expect(described_class.reference_for(%w[Container Unknown])).to eq(
        described_class.reference_for([])
      )
    end
  end

  describe 'LEGACY_ALTERNATIVES' do
    it 'names an alternative for every legacy node type' do
      expect(described_class::LEGACY_ALTERNATIVES.keys)
        .to match_array(ContentBuilder::Craftjs::WidgetSpecs::LEGACY_WIDGETS)
    end
  end

  describe 'the page scaffold' do
    it 'are all registered widgets, without insertable docs' do
      scaffold_widgets.each do |name|
        expect(ContentBuilder::Craftjs::WidgetSpecs::SPECS).to have_key(name)
        expect(described_class::DOCS).not_to have_key(name),
          "scaffold widget #{name} must not be advertised as insertable"
      end
    end

    it 'covers the canonical nodes the backend seeds, minus the movable widgets' do
      seeded = ContentBuilder::ProjectPageLayoutService.new
        .from_description_multiloc({})
        .values
        .map { |node| node.dig('type', 'resolvedName') }

      # Besides the scaffold, the seed places only ordinary registered widgets (the
      # phases and events widgets and the default template content).
      expect(seeded).to include(*scaffold_widgets)
      movable = seeded.uniq - scaffold_widgets
      expect(ContentBuilder::Craftjs::WidgetSpecs::SPECS.keys).to include(*movable)
      expect(described_class::DOCS).to include('PhasesWidget', 'EventsWidget')
    end
  end

  describe 'FORMAT_RULES' do
    it 'names every scaffold widget, since they are documented nowhere else' do
      scaffold_widgets.each do |name|
        expect(described_class::FORMAT_RULES).to include(name)
      end
    end
  end
end
