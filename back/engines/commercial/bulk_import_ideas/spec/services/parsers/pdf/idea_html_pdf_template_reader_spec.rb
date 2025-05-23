# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::Pdf::IdeaHtmlPdfTemplateReader do
  describe 'template_data' do
    # NOTE: When changing these tests ensure that the PDF ideation form below matches the form created here
    context 'ideation form' do
      let_it_be(:project) { create(:single_phase_ideation_project) }
      let_it_be(:form) do
        form = create(
          :custom_form,
          :with_default_fields,
          participation_context: project,
          print_start_multiloc: { 'en' => '<h2>Welcome to the survey</h2>' },
          print_end_multiloc: { en: '<h2>Thank you for submitting the form</h2><p>It really is very kind of you to do so.</p>' }
        )
        create(:custom_field, resource: form, title_multiloc: { en: 'A short answer question' }, ordering: 7, key: 'short_answer_1')
        select1 = create(:custom_field_multiselect, resource: form, title_multiloc: { en: 'A single choice question' }, ordering: 8, key: 'singlechoice_1')
        create(:custom_field_option, custom_field: select1, title_multiloc: { en: 'Option one' }, key: 'option_one_1')
        create(:custom_field_option, custom_field: select1, title_multiloc: { en: 'Option two' }, key: 'option_two_1')
        select2 = create(:custom_field_multiselect, resource: form, title_multiloc: { en: 'Multiple choice question' }, ordering: 9, key: 'multichoice_1')
        create(:custom_field_option, custom_field: select2, title_multiloc: { en: 'Option one' }, key: 'option_one_2')
        create(:custom_field_option, custom_field: select2, title_multiloc: { en: 'Option two' }, key: 'option_two_2')
        select3 = create(:custom_field_multiselect, resource: form, title_multiloc: { en: 'Another multiple choice question' }, ordering: 10, key: 'multichoice_2')
        create(:custom_field_option, custom_field: select3, title_multiloc: { en: 'Option one' }, key: 'option_one_3')
        create(:custom_field_option, custom_field: select3, title_multiloc: { en: 'Option two' }, key: 'option_two_3')
        create(:custom_field, resource: form, title_multiloc: { en: 'Short answer question with a really long title that will wrap onto multiple lines' }, ordering: 15, key: 'shortanswer_2')
        form
      end

      let(:service) { described_class.new project.phases.first, 'en', false }
      let(:template_data) { service.send(:template_data) }

      before do
        # Stub the export method to return an actual PDF file from fixtures
        allow_any_instance_of(BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter).to receive(:export).and_return(Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/ideation_form.pdf'))
      end

      it 'returns meta data about the fields in the form that can be imported - page count, fields, options and positions' do
        expect(template_data[:page_count]).to eq 2
        expect(template_data[:fields].count).to eq 14
        expect(template_data[:fields].pluck(:key)).to eq %w[
          title_multiloc
          body_multiloc
          short_answer_1
          singlechoice_1
          option_one_1
          option_two_1
          multichoice_1
          option_one_2
          option_two_2
          multichoice_2
          option_one_3
          option_two_3
          location_description
          shortanswer_2
        ]
        expect(template_data[:fields].pluck(:name)).to eq [
          'Title',
          'Description',
          'A short answer question',
          'A single choice question',
          'Option one',
          'Option two',
          'Multiple choice question',
          'Option one',
          'Option two',
          'Another multiple choice question',
          'Option one',
          'Option two',
          'Location',
          'Short answer question with a really long title that will wrap onto multiple lines'
        ]
        expect(template_data[:fields].pluck(:print_title)).to eq [
          '1. Title',
          '2. Description',
          '5. A short answer question (optional)',
          '6. A single choice question (optional)',
          nil,
          nil,
          '7. Multiple choice question (optional)',
          nil,
          nil,
          '8. Another multiple choice question (optional)',
          nil,
          nil,
          '10. Location (optional)',
          '11. Short answer question with a really long title that will wrap onto multiple lines (optional)'
        ]
        expect(template_data[:fields].pluck(:page)).to eq [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2]
        expect(template_data[:fields].pluck(:position)).to eq [11, 26, 77, 88, 91, 93, 2, 5, 7, 13, 16, 18, 38, 46]
      end

      it 'returns text strings as delimiters that identify the start and end of where text questions values should be' do
        delimiters = template_data[:fields].pluck(:key, :content_delimiters).to_h

        expect(delimiters['title_multiloc']).to eq({
          start: '1. Title',
          end: 'Tell us more'
        })
        expect(delimiters['body_multiloc']).to eq({
          start: '2. Description',
          end: 'Images and attachments'
        })
        expect(delimiters['short_answer_1']).to eq({
          start: '*This answer will only be shared with moderators, and not to the public.',
          end: '6. A single choice question (optional)'
        })
        expect(delimiters['location_description']).to eq({
          start: '10. Location (optional)',
          end: '11. Short answer question with a really long title that will wrap onto' # Only finds the text on the next line (not the whole title)
        })
        expect(delimiters['shortanswer_2']).to eq({
          start: '*This answer will only be shared with moderators, and not to the public.',
          end: 'Thank you for submitting the form'
        })
      end

      it 'returns data from the cache if the form has not changed' do
        Rails.cache.clear
        cache_key = "pdf_importer_data/#{form.id}_en_#{form.updated_at.to_i}_false"

        service1 = described_class.new project.phases.first, 'en', false
        expect(Rails.cache.read(cache_key)).to be_nil
        importer_data1 = service1.template_data
        expect(Rails.cache.read(cache_key)).to eq importer_data1

        allow(PDF::Reader).to receive(:new)
        service2 = described_class.new project.phases.first, 'en', false
        importer_data2 = service2.template_data
        expect(PDF::Reader).not_to have_received(:new)

        expect(importer_data2).to eq importer_data1
      end
    end
  end
end
