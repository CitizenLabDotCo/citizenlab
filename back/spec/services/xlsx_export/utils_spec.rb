# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::Utils do
  subject(:service) { described_class.new }

  describe 'escape_formula' do
    it 'retains non-strings' do
      expect(service.escape_formula(nil)).to be_nil
      expect(service.escape_formula(100)).to eq 100
      time = Time.zone.now
      expect(service.escape_formula(time)).to eq time
      date = Time.zone.today
      expect(service.escape_formula(date)).to eq date
    end

    it 'retains normal text' do
      text = '1 + 2 = 3'
      expect(service.escape_formula(text)).to eq text
    end

    it 'escapes formula injections' do
      text = "=cmd|' /C notepad'!'A1'"
      expect(service.escape_formula(text)).not_to eq text
    end
  end

  describe 'convert_to_text_long_lines' do
    it 'converts html to text and replaces each newline by a space' do
      actual = service.convert_to_text_long_lines(+"<p>line1<p>\n<strong>line2</strong>")
      expect(actual).to eq 'line1 line2'
    end
  end

  describe '#sanitize_sheetname' do
    context 'when the sheetname can be sanitized' do
      using RSpec::Parameterized::TableSyntax

      where(:sheetname, :expected_sanitized_sheetname) do
        # rubocop:disable Lint/BinaryOperatorWithIdenticalOperands
        'sheet name'                          | 'sheet name'
        'sheet_name'                          | 'sheet_name'
        'sheet-name'                          | 'sheet-name'
        # rubocop:enable Lint/BinaryOperatorWithIdenticalOperands
        'sheet:name'                          | 'sheetname'
        "''leading-quotes"                    | 'leading-quotes'
        "trailing-quotes''"                   | 'trailing-quotes'
        'too_long......................|....' | 'too_long......................|'
        'With illegal characters \/*?:[]'     | 'With illegal characters '
      end

      with_them do
        specify do
          sanitized_sheetname = service.send(:sanitize_sheetname, sheetname)
          expect(sanitized_sheetname).to eq(expected_sanitized_sheetname)
        end
      end
    end

    context 'when the sheetname cannot be sanitized' do
      where(sheetname: ['History', "'History'", '[History]', '', '\/*?:[]'])

      with_them do
        specify do
          expect { service.send(:sanitize_sheetname, sheetname) }
            .to raise_error(XlsxExport::InvalidSheetnameError)
        end
      end
    end
  end
end
