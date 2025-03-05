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
    parameter :col_category_type, 'What entity should be shown in the columns of the heatmap? One of `tags`, `user_custom_field` or `input_custom_field`'
    parameter :col_category_id, 'The ID of the entity that should be shown in the columns of the heatmap. Not relevant if col_category_type is `tags`.'
    parameter :unit, 'The unit of the heatmap. One of `inputs`, `likes`, `dislikes` or `engagement`', default: 'inputs'
    parameter :max_p_value, 'The p-value threshold for the heatmap. Only cells with a p-value below this threshold will be returned'
    parameter :min_lift_diff, 'The minimal percentage points of difference with 100% in lift. Only cells with a lift difference above this threshold will be returned. E.g. passing 50 will only return cells with a lift < 0.5 or > 1.5'

    with_options scope: :page_params do
      parameter :number, 'Page number'
      parameter :size, 'Number of cells per page'
    end

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:heatmap_cells) { create_list(:heatmap_cell, 2, analysis: analysis) }

    example 'List all heatmap cells for an analysis' do
      do_request

      expect(status).to eq 200
      expect(response_data.size).to eq(2)

      expect(response_data.first[:attributes]).to include(
        count: 10,
        lift: 1.1,
        p_value: 0.1,
        unit: 'inputs'
      )
      expect(response_data.first[:relationships]).to include(
        analysis: { data: { id: analysis.id, type: 'analysis' } },
        column: { data: { id: heatmap_cells.first.column.id, type: 'custom_field_option' } },
        row: { data: { id: heatmap_cells.first.row.id, type: 'tag' } }
      )
    end
  end
end
