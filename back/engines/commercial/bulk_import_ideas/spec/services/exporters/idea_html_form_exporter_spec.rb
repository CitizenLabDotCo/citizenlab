# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Exporters::IdeaHtmlFormExporter do
  let(:service) { described_class.new phase, 'en', false }

  let(:project) { create(:project, title_multiloc: { en: 'PROJECT' }) }
  let(:phase) { create(:native_survey_phase, project: project, title_multiloc: { en: 'PHASE' }) }
  let(:custom_form) { create(:custom_form, participation_context: phase) }
  let!(:page_field) { create(:custom_field_page, resource: custom_form) }
  let!(:text_field) { create(:custom_field_text, resource: custom_form, required: true, title_multiloc: { 'en' => 'Text field' }) }
  let!(:multiline_field) { create(:custom_field_multiline_text, resource: custom_form, title_multiloc: { 'en' => 'Multiline field' }) }
  let!(:select_field) do
    field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' })
    field.options.create!(key: 'option1', title_multiloc: { 'en' => 'Option 1' })
    field.options.create!(key: 'option2', title_multiloc: { 'en' => 'Option 2' })
    field
  end
  let!(:end_page_field) { create(:custom_field_form_end_page, resource: custom_form) }

  describe 'export' do
    let!(:parsed_html) { Nokogiri::HTML(service.export) }

    it 'returns project & phase as <h1>' do
      expect(parsed_html.css('h1').text).to eq 'PROJECT - PHASE'
    end

    context 'personal data not enabled' do
      it 'does not return a personal data section' do
        expect(parsed_html.css('div#personal-data')).to be_empty
      end
    end

    context 'personal data enabled' do
      let(:service) { described_class.new phase, 'en', true }

      it 'returns personal data fields' do
        personal_data = parsed_html.css('div#personal-data')
        expect(personal_data).to be_present

        expect(personal_data.css('h2').text).to eq 'Personal data'

        fields = personal_data.css('h3').map(&:text)
        expect(fields[0]).to eq 'First name(s) (optional)'
        expect(fields[1]).to eq 'Last name (optional)'
        expect(fields[2]).to eq 'Email address (optional)'
      end
    end

    context 'questions' do
      let!(:titles) { parsed_html.css('div#questions div.question h2').map(&:text) }

      it 'returns title, description of all questions' do
        expect(titles[0]).to include 'Text field'
        expect(titles[1]).to include 'Multiline field'
        expect(titles[2]).to include 'Select field'
      end

      it 'shows optional if questions are not required' do
        expect(titles[0]).not_to include '(optional)'
        expect(titles[1]).to include '(optional)'
        expect(titles[2]).to include '(optional)'
      end

      it 'shows 1 line for short text fields' do
        single_line_text = parsed_html.css('div#questions div.question')[0]
        expect(single_line_text.css('div.line').count).to eq 1
      end

      it 'shows 7 lines for longer text fields' do
        multi_line_text = parsed_html.css('div#questions div.question')[1]
        expect(multi_line_text.css('div.line').count).to eq 7
      end
    end
  end
end
