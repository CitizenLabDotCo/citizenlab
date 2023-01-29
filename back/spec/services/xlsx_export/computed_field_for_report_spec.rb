# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::ComputedFieldForReport do
  subject(:report_field) do
    described_class.new(column_header, ->(model) { model.budget })
  end

  let(:model) { instance_double Idea, budget: 123 }
  let(:column_header) { 'The column header' }

  describe 'value_from' do
    it 'returns the result of calling the given proc' do
      expect(report_field.value_from(model)).to eq 123
    end
  end

  describe 'column_header' do
    it 'returns the column header' do
      expect(report_field.column_header).to eq column_header
    end
  end
end
