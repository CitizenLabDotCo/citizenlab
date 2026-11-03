# frozen_string_literal: true

require 'rails_helper'

# Guards against the widget rules (ReportBuilder::Craftjs::WidgetSpecs) and the
# LLM-facing docs drifting apart.
describe ReportBuilder::Craftjs::LayoutWidgets do
  let(:specs) { ReportBuilder::Craftjs::WidgetSpecs::SPECS }

  describe 'DOCS' do
    it 'documents only widgets that exist in the widget specs' do
      expect(described_class::DOCS.keys - specs.keys).to be_empty
    end

    it 'partitions the widget specs exactly into documented and explicitly undocumented widgets' do
      covered = described_class::DOCS.keys + described_class::UNDOCUMENTED_WIDGETS

      expect(covered).to match_array(specs.keys)
    end

    it 'documents every enum value (except the legacy empty string) in the widget doc' do
      described_class::DOCS.each do |name, doc|
        enums = specs.dig(name, 'enums') || {}
        enums.each do |prop, values|
          values.reject(&:empty?).each do |value|
            expect(doc).to include(value),
              "expected the #{name} doc to mention #{prop} value '#{value}'"
          end
        end
      end
    end

    it 'never advertises a deprecated widget as insertable' do
      ReportBuilder::Craftjs::WidgetSpecs::DEPRECATED_WIDGETS.each do |name|
        expect(specs).to have_key(name)
        expect(described_class::DOCS).not_to have_key(name)
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
      expect(described_class.reference_for(%w[ImageMultiloc Unknown]))
        .to eq described_class.reference_for([])
    end
  end

  # The layout sanitizer drops tags it does not allow without saying so, so a doc
  # that advertises the wrong tags costs the composer a section with no error to
  # learn from.
  describe 'the TextMultiloc doc against the sanitizer that runs on save' do
    def sanitize(html)
      ContentBuilder::LayoutSanitizationService.new.sanitize(
        {
          'ROOT' => { 'type' => 'div', 'nodes' => ['textnode01'] },
          'textnode01' => {
            'type' => { 'resolvedName' => 'TextMultiloc' },
            'props' => { 'text' => { 'en' => html } }
          }
        }
      ).dig('textnode01', 'props', 'text', 'en')
    end

    it 'keeps the heading levels the doc advertises' do
      expect(sanitize('<h2>Section</h2><h3>Sub</h3>')).to eq '<h2>Section</h2><h3>Sub</h3>'
    end

    it 'drops h1, which is why the doc says the highest heading is h2' do
      expect(described_class::DOCS['TextMultiloc']).to include 'no h1'
      expect(sanitize('<h1>Title</h1>')).not_to include '<h1>'
    end
  end

  describe 'FORMAT_RULES' do
    it 'describes the ROOT node, which is documented nowhere else' do
      expect(described_class::FORMAT_RULES).to include(ReportBuilder::Craftjs::WidgetSpecs::ROOT_TYPE)
      expect(described_class::FORMAT_RULES).to include('e2e-content-builder-frame')
    end
  end
end
