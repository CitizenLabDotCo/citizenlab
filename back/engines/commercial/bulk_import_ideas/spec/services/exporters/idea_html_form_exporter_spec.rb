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
  let!(:multiselect_field) do
    field = create(:custom_field_multiselect, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Select field' })
    field.options.create!(key: 'option1', title_multiloc: { 'en' => 'Option 1' })
    field.options.create!(key: 'option2', title_multiloc: { 'en' => 'Option 2' })
    field
  end
  let!(:ranking_field) do
    field = create(:custom_field_ranking, resource: custom_form, key: 'ranking_field', title_multiloc: { 'en' => 'Ranking field' })
    field.options.create!(key: 'ranking_one', title_multiloc: { 'en' => 'Ranking one' })
    field.options.create!(key: 'ranking_two', title_multiloc: { 'en' => 'Ranking two' })
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
      let!(:titles) { parsed_html.css('div#questions div.question h3').map(&:text) }

      it 'returns title of all questions' do
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
        single_line_text = parsed_html.css("div##{text_field.id}")
        expect(single_line_text.css('div.line').count).to eq 1
      end

      it 'shows 7 lines for longer text fields' do
        multi_line_text = parsed_html.css("div##{multiline_field.id}")
        expect(multi_line_text.css('div.line').count).to eq 7
      end

      it 'shows multiselect instructions and options' do
        multiselect = parsed_html.css("div##{multiselect_field.id}")
        expect(multiselect.text).to include '*Choose as many as you like'
        expect(multiselect.text).to include 'Option 1'
        expect(multiselect.text).to include 'Option 2'
      end

      it 'shows ranking instructions and options' do
        ranking = parsed_html.css("div##{ranking_field.id}")
        expect(ranking.text).to include 'Please write a number from 1 (most preferred) and 2 (least preferred) in each box. Use each number only once.'
        expect(ranking.text).to include 'Ranking one'
        expect(ranking.text).to include 'Ranking two'
      end
    end
  end

  describe 'font_family' do
    let(:font_family) { service.send(:font_family) }

    it 'returns default fonts by default' do
      expect(font_family).to eq "'Public Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif"
    end

    it 'returns custom font name if set' do
      allow(AppConfiguration.instance).to receive(:style).and_return('customFontName' => 'Fonty McFontface')
      expect(font_family).to eq "'Fonty McFontface', 'Public Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif"
    end
  end

  describe 'font_config' do
    let(:font_config) { service.send(:font_config) }

    it 'returns nil by default' do
      expect(font_config).to be_nil
    end

    it 'returns font loader config if customFontAdobeId is set' do
      allow(AppConfiguration.instance).to receive(:style).and_return('customFontAdobeId' => 'lord_font_of_fonttown')
      expect(font_config).to eq({
        typekit: {
          id: 'lord_font_of_fonttown'
        }
      }.to_json)
    end
  end

  describe 'font_styles' do
    let(:font_styles) { service.send(:font_styles) }

    it 'returns nothing by default' do
      expect(font_styles).to be_nil
    end

    it 'returns nothing if only customFontURL is set' do
      allow(AppConfiguration.instance).to receive(:style).and_return('customFontURL' => 'http://example.com/fonts.css')
      expect(font_styles).to be_nil
    end

    it 'returns nothing if only customFontName is set' do
      allow(AppConfiguration.instance).to receive(:style).and_return('customFontName' => 'Fonty McFontface')
      expect(font_styles).to be_nil
    end

    it 'returns font styles replaced with base64 encoded versions of the font files' do
      allow(AppConfiguration.instance).to receive(:style).and_return(
        'customFontName' => 'Fonty McFontface',
        'customFontURL' => 'https://example.com/fonts.css'
      )

      # Mock the returns of Net::HTTP.get
      allow(Net::HTTP).to receive(:get).with(URI.parse('https://example.com/fonts.css')).and_return("
        @font-face {
            font-family: 'FontyMcFontFace';
            src:url('/fonts/WOFF/FontyMcFontFace.woff') format('woff');
          }
        @font-face {
          font-family: 'FontyMcFontFaceItalic';
          src:url('/fonts/WOFF/FontyMcFontFaceItalic.woff') format('woff');
        }
      ")
      allow(Net::HTTP).to receive(:get).with(URI.parse('https://example.com/fonts/WOFF/FontyMcFontFace.woff')).and_return('NORMAL')
      allow(Net::HTTP).to receive(:get).with(URI.parse('https://example.com/fonts/WOFF/FontyMcFontFaceItalic.woff')).and_return('ITALIC')

      expect(font_styles).to eq("
        @font-face {
            font-family: 'FontyMcFontFace';
            src:url('data:font/woff;base64,Tk9STUFM') format('woff');
          }
        @font-face {
          font-family: 'FontyMcFontFaceItalic';
          src:url('data:font/woff;base64,SVRBTElD') format('woff');
        }
      ")
    end
  end

  describe 'custom_font_url' do
    it 'returns the existing host in the URL if it is absolute' do
      custom_font_url = service.send(:custom_font_url, 'https://test.com/fonts.css', 'https://other.com')
      expect(custom_font_url.to_s).to eq 'https://test.com/fonts.css'
    end

    it 'returns the URL with the supplied host if it is relative' do
      custom_font_url = service.send(:custom_font_url, '/fonts.css', 'https://other.com')
      expect(custom_font_url.to_s).to eq 'https://other.com/fonts.css'
    end
  end

  describe 'group_fields' do
    it 'groups page fields with their first child question, otherwise each question has its own group' do
      # NOTE: Truncated fields object - only includes what is necessary for the method
      fields = [
        { input_type: 'page' },
        { input_type: 'text_multiloc' },
        { input_type: 'page' },
        { input_type: 'html_multiloc' },
        { input_type: 'page' },
        { input_type: 'image_files' },
        { input_type: 'files' },
        { input_type: 'page' },
        { input_type: 'page' },
        { input_type: 'multiline_text' },
        { input_type: 'text' },
        { input_type: 'page' }
      ]

      expect(service.send(:group_fields, fields)).to eq [
        { input_type: 'page', field_group: { start: true, end: false } },
        { input_type: 'text_multiloc', field_group: { start: false, end: true } },
        { input_type: 'page', field_group: { start: true, end: false } },
        { input_type: 'html_multiloc', field_group: { start: false, end: true } },
        { input_type: 'page', field_group: { start: true, end: false } },
        { input_type: 'image_files', field_group: { start: false, end: true } },
        { input_type: 'files', field_group: { start: true, end: true } },
        { input_type: 'page', field_group: { start: true, end: true } },
        { input_type: 'page', field_group: { start: true, end: false } },
        { input_type: 'multiline_text', field_group: { start: false, end: true } },
        { input_type: 'text', field_group: { start: true, end: true } },
        { input_type: 'page', field_group: { start: true, end: true } }
      ]
    end
  end
end
