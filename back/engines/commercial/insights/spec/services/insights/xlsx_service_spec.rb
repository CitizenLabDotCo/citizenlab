# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

RSpec.describe XlsxService do
  let(:service) { Insights::XlsxService.new }

  # rubocop:disable RSpec/MultipleMemoizedHelpers
  describe 'generate_inputs_xlsx' do
    let(:view) { create(:view, nb_data_sources: 3) }
    let(:ideas) { Insights::InputsFinder.new(view).execute }
    let(:categories) { create_list(:category, 2, view: view) }
    let(:xlsx) { service.generate_inputs_xlsx(ideas, categories, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    before do
      ideas = view.source_projects.map { |p| create(:idea, project: p) }
      ideas.first.author.destroy! # should be able to handle ideas without author

      other_category = create(:category) # category from another view
      Insights::CategoryAssignmentsService.new.add_assignments_batch(ideas, categories.push(other_category))
    end

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every idea' do
      expect(worksheet.sheet_data.size).to eq(ideas.size + 1)
    end

    it 'contains a column for every category' do
      category_one_col = worksheet.map { |col| col.cells[3].value }
      _header, *category_one = category_one_col

      category_two_col = worksheet.map { |col| col.cells[4].value }
      _header, *category_two = category_two_col

      aggregate_failures do
        expect(category_one).to match %w[approved approved approved]
        expect(category_two).to match %w[approved approved approved]
      end
    end

    context 'when not allowed to see private attributes' do
      let(:xlsx) { service.generate_inputs_xlsx(ideas, categories, view_private_attributes: false) }

      it 'hides private attributes' do
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
      end
    end
  end
  # rubocop:enable RSpec/MultipleMemoizedHelpers
end
