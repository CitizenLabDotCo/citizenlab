# frozen_string_literal: true

require 'rails_helper'

describe Export::Xlsx::Generator do
  describe '#unique_sheet_names' do
    def sheet_names(*titles)
      phases = titles.map { |title| build_stubbed(:phase, title_multiloc: { 'en' => title }) }
      described_class.new.send(:unique_sheet_names, phases).values
    end

    it 'keeps distinct titles as they are, sanitized' do
      expect(sheet_names('Ideas: round 1', 'Survey')).to eq ['Ideas round 1', 'Survey']
    end

    it 'numbers titles that only become the same once sanitized' do
      expect(sheet_names('Phase 1: Ideation', 'Phase 1 Ideation')).to eq ['Phase 1 Ideation (1)', 'Phase 1 Ideation (2)']
    end

    it 'numbers titles that only differ in case' do
      expect(sheet_names('Survey', 'survey')).to eq ['Survey (1)', 'survey (2)']
    end

    it 'keeps the number within the 31-character limit for long titles' do
      long_title = 'A very long phase title that goes on and on'
      names = sheet_names(long_title, long_title)

      expect(names).to eq ['A very long phase title tha (1)', 'A very long phase title tha (2)']
      expect(names.map(&:length)).to all(eq 31)
    end
  end
end
