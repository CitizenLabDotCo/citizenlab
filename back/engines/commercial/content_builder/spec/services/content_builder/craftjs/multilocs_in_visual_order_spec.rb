# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::MultilocsInVisualOrder do
  subject(:service) { described_class.new(json, with_metadata: with_metadata) }

  def load_fixture(file_name)
    Pathname.new(File.dirname(__FILE__)).join('fixtures', file_name).read
  end

  let(:json) do
    JSON.parse(load_fixture('example_description_craftjs.json'))
  end

  describe '#multilocs_in_natural_order' do
    context 'without metadata' do
      let(:with_metadata) { false }

      it 'returns the multilocs in natural order' do
        expect(service.extract).to eq(
          [
            { 'en' => '<h2>Title 1</h2>' },
            { 'en' => '<p>2colsA: Para 1 col 1</p>' },
            { 'en' => '<p>2colsA: Para 1a col 1</p>' },
            { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-BE' => '<p>2colsA: Para 2 col 1</p>' },
            { 'en' => '<p>2colsA: Para 1 col 2</p>' },
            { 'en' => '<p>3colsA: Para 1 col 1</p>' },
            { 'en' => '<p>3colsA: Para 1 col 2</p>' },
            { 'en' => '<p>3colsA: Para 2 col 2</p>' },
            { 'en' => '<p>3colsA: Para 1 col 3</p>' },
            { 'en' => '<h2>Title 2</h2>' },
            { 'en' => 'accordianA title' },
            { 'en' => '<p>accordianA text</p>' },
            { 'en' => '<p>2colsB: Para 1 col1</p>' },
            { 'en' => '<p>2colsC: Para 1 col1 </p>' },
            { 'en' => '<p>2colsC: Para 2 col1</p>' },
            { 'en' => '<p>2colsC: Para 1 col2</p>' },
            { 'en' => '<p>2colsC: Para 2 col2</p>' },
            { 'en' => '<p>2colsB: Para 1 col2</p>' },
            { 'en' => 'accordianB title' },
            { 'en' => '<p>accordianB text</p>' },
            { 'en' => 'accordianC title' },
            { 'en' => '<p>accordianC text</p>' },
            { 'en' => '<p>infoAndAccordians text</p>' },
            { 'en' => 'accordianD title' },
            { 'en' => '<p>accordianD text</p>' },
            { 'en' => 'accordianE title' },
            { 'en' => '<p>accordianE text</p>' },
            { 'en' => 'accordianF title' },
            { 'en' => '<p>accordianF text</p>' },
            { 'en' => '<p>imageAndTextA text</p>' },
            { 'en' => '<p>imageAndTextB text</p>' },
            { 'en' => '<p>imageAndTextC text</p>' }
          ]
        )
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
              multliloc: { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-BE' => '<p>2colsA: Para 2 col 1</p>' },
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
              multliloc: { 'en' => 'accordianA title' },
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
              multliloc: { 'en' => 'accordianB title' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianB text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => 'accordianC title' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianC text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>infoAndAccordians text</p>' },
              node_type: 'TextMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => 'accordianD title' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianD text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => 'accordianE title' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'text',
              multliloc: { 'en' => '<p>accordianE text</p>' },
              node_type: 'AccordionMultiloc' },
            { multiloc_type: 'title',
              multliloc: { 'en' => 'accordianF title' },
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
    end
  end
end
