# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'HeatmapCells' do
  explanation 'A heatmap cell represents the statistical significance and size of a relationship between tags/custom_field_options'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/heatmap_cells' do
    parameter :row_category_type, 'What entity should be shown in the rows of the heatmap? One of `tags`, `user_custom_field` or `input_custom_field`'
    parameter :row_category_id, 'The ID of the entity that should be shown in the rows of the heatmap. Not relevant if row_category_type is `tags`.'
    parameter :column_category_type, 'What entity should be shown in the columns of the heatmap? One of `tags`, `user_custom_field` or `input_custom_field`'
    parameter :column_category_id, 'The ID of the entity that should be shown in the columns of the heatmap. Not relevant if column_category_type is `tags`.'
    parameter :unit, 'The unit of the heatmap. One of `inputs`, `likes`, `dislikes` or `participants`', default: 'inputs'
    parameter :max_p_value, 'The p-value threshold for the heatmap. Only cells with a p-value below this threshold will be returned'
    parameter :min_lift_diff, 'The minimal percentage points of difference with 100% in lift. Only cells with a lift difference above this threshold will be returned. E.g. passing 50 will only return cells with a lift <= 0.5 or >= 1.5'

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of cells per page'
    end

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:heatmap_cells) do
      [
        create(:heatmap_cell, analysis: analysis, lift: 1.1),
        create(:heatmap_cell, analysis: analysis, lift: 1.2)
      ]
    end

    example 'List all heatmap cells for an analysis, order by descending lift diff' do
      do_request

      expect(status).to eq 200
      expect(response_data.size).to eq(2)

      expect(response_data.first[:attributes]).to include(
        count: 10,
        lift: 1.2,
        p_value: 0.1,
        unit: 'inputs',
        statement_multiloc: kind_of(Hash)
      )
      expect(response_data.first[:relationships]).to include(
        analysis: { data: { id: analysis.id, type: 'analysis' } },
        column: { data: { id: heatmap_cells[1].column.id, type: 'custom_field_bin' } },
        row: { data: { id: heatmap_cells[1].row.id, type: 'tag' } }
      )
    end

    example 'List heatmap cells with pagination' do
      do_request(page: { size: 1, number: 2 })

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(heatmap_cells[0].id)
    end

    example 'Respects the row_category filters' do
      create(:heatmap_cell, analysis:, row: create(:option_bin))
      cell = create(:heatmap_cell, analysis:, row: create(:option_bin))
      custom_field = cell.row.custom_field
      row_category_type = 'user_custom_field'
      row_category_id = custom_field.id

      do_request(row_category_type:, row_category_id:)

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(cell.id)
    end

    example 'Respects the column_category filters' do
      column_category_type = 'user_custom_field'
      column_category_id = heatmap_cells[0].column.custom_field.id

      do_request(column_category_type:, column_category_id:)

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(heatmap_cells.first.id)
    end

    example 'Respects the combination of row_category and column_category filters' do
      create(:heatmap_cell, analysis:, row: create(:option_bin), column: create(:option_bin))
      cell = create(:heatmap_cell, analysis:, row: create(:option_bin), column: create(:option_bin))
      custom_field = cell.row.custom_field
      row_category_type = 'user_custom_field'
      row_category_id = custom_field.id
      column_category_type = 'input_custom_field'
      column_category_id = cell.column.custom_field.id

      do_request(row_category_type:, row_category_id:, column_category_type:, column_category_id:)

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(cell.id)
    end

    example 'It also searches for swapped row/column category filters' do
      create(:heatmap_cell, analysis:, row: create(:option_bin), column: create(:option_bin))
      cell = create(:heatmap_cell, analysis:, row: create(:option_bin), column: create(:option_bin))
      custom_field = cell.row.custom_field
      column_category_type = 'user_custom_field'
      column_category_id = custom_field.id
      row_category_type = 'input_custom_field'
      row_category_id = cell.column.custom_field.id

      do_request(row_category_type:, row_category_id:, column_category_type:, column_category_id:)

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(cell.id)
    end

    example 'Respects the unit filter' do
      cell = create(:heatmap_cell, analysis:, unit: 'likes')

      do_request(unit: 'likes')

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(cell.id)
    end

    example 'Respects the max_p_value filter' do
      max_p_value = 0.05
      cell = create(:heatmap_cell, analysis:, p_value: max_p_value)

      do_request(max_p_value:)

      expect(status).to eq 200
      expect(response_data.size).to eq(1)
      expect(response_data.first[:id]).to eq(cell.id)
    end

    example 'Respects the min_lift_diff filter' do
      min_lift_diff = 60
      cell1 = create(:heatmap_cell, analysis:, lift: 1.6)
      cell2 = create(:heatmap_cell, analysis:, lift: 0.4)

      do_request(min_lift_diff:)

      expect(status).to eq 200
      expect(response_data.size).to eq(2)
      expect(response_data.map { _1[:id] }).to match_array([cell1.id, cell2.id])
    end
  end
end
