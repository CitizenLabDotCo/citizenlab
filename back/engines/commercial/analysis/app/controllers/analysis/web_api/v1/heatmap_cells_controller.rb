# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class HeatmapCellsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          heatmap_cells = @analysis.heatmap_cells.includes(:row, :column)
          heatmap_cells = heatmap_cells.order(Arel.sql('abs(1 - lift) DESC'))
          heatmap_cells = apply_filters(heatmap_cells)
          heatmap_cells = paginate(heatmap_cells)

          # Return no content if the analysis has no heatmap cells
          return head :no_content if @analysis.heatmap_cells.empty?

          render json: WebApi::V1::HeatmapCellSerializer.new(
            heatmap_cells,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def apply_filters(heatmap_cells)
          heatmap_cells = heatmap_cells.where(unit: params[:unit]) if params[:unit].present?

          row_column_filters = {}
          if params[:row_category_type].present?
            row_type = category_type_to_item_type(params[:row_category_type])
            row_column_filters[:row_type] = row_type
            if params[:row_category_id].present?
              row_id = category_to_item_id(params[:row_category_type], params[:row_category_id])
              row_column_filters[:row_id] = row_id
            end
          end

          if params[:column_category_type].present?
            column_type = category_type_to_item_type(params[:column_category_type])
            row_column_filters[:column_type] = column_type
            if params[:column_category_id].present?
              column_id = category_to_item_id(params[:column_category_type], params[:column_category_id])
              row_column_filters[:column_id] = column_id
            end
          end

          if row_column_filters.present?
            # Because the front-end needs to control what's in the rows and what's in the columns, we not only query for the requested row/column combination, but also for the transposed version (row and column swapped). In the back-end we only generate one version, not the transposed versions too.
            heatmap_cells = heatmap_cells.where(row_column_filters).or(
              heatmap_cells.where(
                row_type: row_column_filters[:column_type],
                row_id: row_column_filters[:column_id],
                column_type: row_column_filters[:row_type],
                column_id: row_column_filters[:row_id]
              )
            )
          end

          heatmap_cells = heatmap_cells.where(p_value: ..(params[:max_p_value])) if params[:max_p_value].present?

          if params[:min_lift_diff].present?
            heatmap_cells = heatmap_cells.with_min_lift_diff(params[:min_lift_diff].to_f)
          end
          heatmap_cells
        end

        def category_type_to_item_type(category_type)
          case category_type
          when 'tags'
            Tag.name
          when 'user_custom_field', 'input_custom_field'
            CustomFieldBin.name
          end
        end

        def category_to_item_id(category_type, category_id)
          case category_type
          when 'tags'
            raise "Don't supply a category_id if the category_type is tags"
          when 'user_custom_field', 'input_custom_field'
            CustomFieldBin.where(custom_field_id: category_id)
          end
        end

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end
      end
    end
  end
end
