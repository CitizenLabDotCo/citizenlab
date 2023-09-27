# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { described_class.new }

  describe 'generate_ideas_xlsx' do
    before do
      @project = create(:project)
      @idea1 = create(:idea, project: @project)
      @idea2 = create(:idea, project: @project)
      create(:idea_import, idea: @idea2)
    end

    let(:xlsx) { service.generate_ideas_xlsx([@idea1, @idea2], view_private_attributes: false) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'includes imported value' do
      headers = worksheet[0].cells.map(&:value)
      import_column_index = headers.find_index 'imported'
      idea1_row = worksheet[1].cells.map(&:value)
      idea2_row = worksheet[2].cells.map(&:value)
      expect(import_column_index).to be_present
      expect(idea1_row[import_column_index]).to eq 'false'
      expect(idea2_row[import_column_index]).to eq 'true'
    end
  end
end
