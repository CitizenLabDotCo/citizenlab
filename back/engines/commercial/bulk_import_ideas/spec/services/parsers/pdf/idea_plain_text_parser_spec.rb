# frozen_string_literal: true

require 'rails_helper'
require_relative '../shared/pdf_parser_data_setup'

describe BulkImportIdeas::Parsers::Pdf::IdeaPlainTextParser do
  include_context 'pdf_parser_data_setup'

  let(:service) { described_class.new('en') }

  describe 'parse_text' do
    it 'parsed the raw text and returns structured fields' do
      result = service.parse_text(google_raw_text_array, pdf_template_data)
      expect(result).to eq(raw_text_parsed_idea)
    end
  end

  describe 'extract_text_between' do
    let(:text) { 'This is a test. Start here. This is the text we want. End here. This is after.' }

    it 'returns the text between start and end strings' do
      start_string = 'Start here.'
      end_string = 'End here.'
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq('This is the text we want.')
    end

    it 'returns the text after the start string' do
      start_string = 'Start here.'
      end_string = nil
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq('This is the text we want. End here. This is after.')
    end

    it 'strips the end text only if start string does not match' do
      start_string = 'NOT MATCHING'
      end_string = 'End here.'
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq('This is a test. Start here. This is the text we want.')
    end

    it 'returns the full text if start string is blank' do
      start_string = nil
      end_string = 'End here.'
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq(text)
    end

    it 'returns the full text if start string is less than 8 characters long' do
      start_string = 'Start'
      end_string = 'End here.'
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq(text)
    end

    it 'returns the text between start and end strings even when the case is different' do
      start_string = 'StArt here.'
      end_string = 'End hEre.'
      result = service.send(:extract_text_between, text, start_string, end_string)
      expect(result).to eq('This is the text we want.')
    end
  end
end
