# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Extractors::BaseExtractor do
  let(:service) { described_class.new('en', nil) }

  let(:column_name) { 'A question name here' }

  describe '#clean_string_value' do
    it 'removes extra spaces around commas and colons' do
      value = '  This is a test,   with some : extra spaces , and : colons  '
      cleaned_value = service.send(:clean_string_value, value)
      expect(cleaned_value).to eq('This is a test, with some: extra spaces, and: colons')
    end

    it 'strips leading and trailing spaces' do
      value = '   Leading and trailing spaces   '
      cleaned_value = service.send(:clean_string_value, value)
      expect(cleaned_value).to eq('Leading and trailing spaces')
    end

    it 'returns the original value if it is not a string' do
      value = 345
      cleaned_value = service.send(:clean_string_value, value)
      expect(cleaned_value).to eq(345)
    end
  end

  describe '#ensure_string_values' do
    let(:idea_rows) do
      [
        { column_name => 'This is a test' },
        { column_name => nil },
        { column_name => 123 },
        { column_name => 'Another test' }
      ]
    end

    it 'ensures all values in the specified column are strings' do
      new_rows = service.send(:ensure_string_values, idea_rows, column_name)
      expect(new_rows).to eq([
        { column_name => 'This is a test' },
        { column_name => nil }, # nil remains unchanged
        { column_name => '123' }, # number becomes string
        { column_name => 'Another test' }
      ])
    end
  end

  describe '#standardise_delimiters' do
    context 'Multiselect' do
      let(:values) { ['Swim', 'Play', 'Run, or jog', 'Bike'] }
      let(:idea_rows) do
        [
          { column_name => 'Play, Run, or jog, Bike' },
          { column_name => 'Swim, Play, Bike' },
          { column_name => 'Run, or jog, Swim' }
        ]
      end

      it 'updates the delimiters to semicolons for multiselect fields' do
        new_rows = service.send(:standardise_delimiters, idea_rows, column_name, values, ',')
        expect(new_rows).to eq([
          { column_name => 'Play; Run, or jog; Bike' },
          { column_name => 'Swim; Play; Bike' },
          { column_name => 'Run, or jog; Swim' }
        ])
      end
    end

    context 'Matrix' do
      let(:values) { ['Satisfied', 'Neutral, not bothered', 'Not satisfied'] }
      let(:idea_rows) do
        [
          { column_name => 'This, that and the other: Satisfied, Something else: Not satisfied, Last one, but not least: Neutral, not bothered' },
          { column_name => 'This, that and the other: Satisfied, Something else: Neutral, not bothered, Last one, but not least: Satisfied' },
          { column_name => 'This, that and the other: Neutral, not bothered, Something else: Not satisfied, Last one, but not least: Not satisfied' }
        ]
      end

      it 'updates the delimiters to semicolons for matrix fields' do
        new_rows = service.send(:standardise_delimiters, idea_rows, column_name, values, ',')
        expect(new_rows).to eq([
          { column_name => 'This, that and the other: Satisfied; Something else: Not satisfied; Last one, but not least: Neutral, not bothered' },
          { column_name => 'This, that and the other: Satisfied; Something else: Neutral, not bothered; Last one, but not least: Satisfied' },
          { column_name => 'This, that and the other: Neutral, not bothered; Something else: Not satisfied; Last one, but not least: Not satisfied' }
        ])
      end
    end
  end

  describe '#sanitize_emails' do
    let(:rows) do
      [
        { 'Email address' => 'bob_smith@somewhere.com' },
        { 'Email address' => 'terry@govocal.com' }
      ]
    end

    it 'obfuscates email addresses if not in production' do
      new_rows = service.send(:sanitize_emails, rows)
      expect(new_rows).to eq([
        { 'Email address' => 'moc_erehwemos_htims_bob@example.com' },
        { 'Email address' => 'moc_lacovog_yrret@example.com' }
      ])
    end

    it 'does not change email addresses in production' do
      allow(Rails.env).to receive(:production?).and_return(true)
      new_rows = service.send(:sanitize_emails, rows)
      expect(new_rows).to eq(rows)
    end
  end
end
