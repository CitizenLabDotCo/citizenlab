require "rails_helper"
require 'rubyXL'


describe XlsxService do
  let(:service) { Insights::XlsxService.new }

  describe "generate_inputs_xlsx" do

    let(:view) { create(:view) }
    before do
      create_list(:idea, 3, project: view.scope).tap do |ideas|
        ideas.first.author.destroy! # should be able to handle ideas without author
        ideas.first.reload
      end
    end
    let(:ideas) { Idea.where(project: view.scope)}

    let(:categories) { create_list(:category, 2, view: view) }
    let(:bad_category) { create(:category) }

    before{ Insights::CategoryAssignmentsService.new.add_assignments_batch(ideas, categories | [bad_category]) }

    let(:xlsx) { service.generate_inputs_xlsx(ideas, categories, true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every idea" do
      expect(worksheet.sheet_data.size).to eq (ideas.size + 1)
    end

    it "contains a column for every category" do
      category_one_col = worksheet.map {|col| col.cells[3].value}
      header, *category_one = category_one_col

      category_two_col = worksheet.map {|col| col.cells[4].value}
      header, *category_two = category_two_col
      aggregate_failures do
        expect(category_one).to match ['approved', 'approved', 'approved']
        expect(category_two).to match ['approved', 'approved', 'approved']
      end
    end

    describe do
      let(:xlsx) { service.generate_inputs_xlsx(ideas, categories, false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
      end
    end
  end
end
