# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::VisibleTextualMultilocs do
  subject(:service) { described_class.new(json, with_metadata: with_metadata) }

  def load_fixture(file_name)
    Pathname.new(File.dirname(__FILE__)).join('fixtures', file_name).read
  end

  let(:json) do
    JSON.parse(load_fixture('example_description_craftjs.json'))
  end

  describe '#extract' do
    context 'without metadata' do
      let(:with_metadata) { false }

      it 'returns the multilocs in natural order' do
        expect(service.extract).to eq(
          [
            { 'en' => '<h2>Title 1</h2>' },
            { 'en' => '<p>2colsA: Para 1 col 1</p>' },
            { 'en' => '<p>2colsA: Para 1a col 1</p>' },
            { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-NL' => '<p>2colsA: Para 2 col 1</p>' },
            { 'en' => '<p>2colsA: Para 1 col 2</p>' },
            { 'en' => '<p>3colsA: Para 1 col 1</p>' },
            { 'en' => '<p>3colsA: Para 1 col 2</p>' },
            { 'en' => '<p>3colsA: Para 2 col 2</p>' },
            { 'en' => '<p>3colsA: Para 1 col 3</p>' },
            { 'en' => '<h2>Title 2</h2>' },
            { 'en' => '<h3>accordianA title</h3>' },
            { 'en' => '<p>accordianA text</p>' },
            { 'en' => '<p>2colsB: Para 1 col1</p>' },
            { 'en' => '<p>2colsC: Para 1 col1 </p>' },
            { 'en' => '<p>2colsC: Para 2 col1</p>' },
            { 'en' => '<p>2colsC: Para 1 col2</p>' },
            { 'en' => '<p>2colsC: Para 2 col2</p>' },
            { 'en' => '<p>2colsB: Para 1 col2</p>' },
            { 'en' => '<h3>accordianB title</h3>' },
            { 'en' => '<p>accordianB text</p>' },
            { 'en' => '<h3>accordianC title</h3>' },
            { 'en' => '<p>accordianC text</p>' },
            { 'en' => '<p>infoAndAccordians text</p>' },
            { 'en' => '<h3>accordianD title</h3>' },
            { 'en' => '<p>accordianD text</p>' },
            { 'en' => '<h3>accordianE title</h3>' },
            { 'en' => '<p>accordianE text</p>' },
            { 'en' => '<h3>accordianF title</h3>' },
            { 'en' => '<p>accordianF text</p>' },
            { 'en' => '<p>imageAndTextA text</p>' },
            { 'en' => '<p>imageAndTextB text</p>' },
            { 'en' => '<p>imageAndTextC text</p>' }
          ]
        )
      end

      # The FE applies this style to the title of an AccordianMultiloc node.
      # Since we get the HTML tags of all other text we extract, we add these tags to clearly indicate the style.
      it 'adds <h3>...</h3> tags to AccordianMultiloc node title text' do
        expect(service.extract).to include({ 'en' => '<h3>accordianA title</h3>' })
      end
    end

    context 'with metadata' do
      let(:with_metadata) { true }

      it 'returns the multilocs in natural order' do
        expect(service.extract).to eq(
          [
            { multiloc_type: 'text',
              multliloc: { 'en' => '<h2>Title 1</h2>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsA: Para 1 col 1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsA: Para 1a col 1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-NL' => '<p>2colsA: Para 2 col 1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsA: Para 1 col 2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>3colsA: Para 1 col 1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>3colsA: Para 1 col 2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>3colsA: Para 2 col 2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>3colsA: Para 1 col 3</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<h2>Title 2</h2>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianA title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianA text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsB: Para 1 col1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsC: Para 1 col1 </p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsC: Para 2 col1</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsC: Para 1 col2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsC: Para 2 col2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>2colsB: Para 1 col2</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianB title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianB text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianC title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianC text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>infoAndAccordians text</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianD title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianD text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianE title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianE text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => '<h3>accordianF title</h3>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianF text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>imageAndTextA text</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>imageAndTextB text</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>imageAndTextC text</p>' },
              node_type: 'TextMultiloc' }
          ]
        )
      end

      # The FE applies this style to the title of an AccordianMultiloc node.
      # Since we get the HTML tags of all other text we extract, we add these tags to clearly indicate the style.
      it 'adds <h3>...</h3> tags to AccordianMultiloc node title text' do
        expect(service.extract).to include({ multiloc_type: 'title',
                                             multliloc: { 'en' => '<h3>accordianA title</h3>' },
                                             node_type: 'AccordionMultiloc' })
      end
    end
  end

  describe '#extract_and_join' do
    let(:with_metadata) { nil }

    it 'returns a multiloc with single values for each tenant locale' do
      expect(service.extract_and_join).to eq(
        {
          'en' => '<h2>Title 1</h2><p>2colsA: Para 1 col 1</p><p>2colsA: Para 1a col 1</p><p>2colsA: Para 2 col 1</p>' \
                  '<p>2colsA: Para 1 col 2</p><p>3colsA: Para 1 col 1</p><p>3colsA: Para 1 col 2</p>' \
                  '<p>3colsA: Para 2 col 2</p><p>3colsA: Para 1 col 3</p><h2>Title 2</h2><h3>accordianA title</h3>' \
                  '<p>accordianA text</p><p>2colsB: Para 1 col1</p><p>2colsC: Para 1 col1 </p>' \
                  '<p>2colsC: Para 2 col1</p><p>2colsC: Para 1 col2</p><p>2colsC: Para 2 col2</p>' \
                  '<p>2colsB: Para 1 col2</p><h3>accordianB title</h3><p>accordianB text</p><h3>accordianC title</h3>' \
                  '<p>accordianC text</p><p>infoAndAccordians text</p><h3>accordianD title</h3><p>accordianD text</p>' \
                  '<h3>accordianE title</h3><p>accordianE text</p><h3>accordianF title</h3><p>accordianF text</p>' \
                  '<p>imageAndTextA text</p><p>imageAndTextB text</p><p>imageAndTextC text</p>',
          'fr-FR' => '',
          'nl-NL' => '<p>2colsA: Para 2 col 1</p>'
        }
      )
    end
  end
end
