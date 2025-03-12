# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class HeatmapCellsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          # This is a temporary mechanism to generate heatmap cells if they are
          # missing. Will be replaced by something smarter that triggers
          # generation soon
          generate_heatmap_cells if @analysis.heatmap_cells.empty?

          heatmap_cells = @analysis.heatmap_cells
          heatmap_cells = heatmap_cells.order(Arel.sql('abs(1 - lift) DESC'))
          heatmap_cells = apply_filters(heatmap_cells)
          heatmap_cells = paginate(heatmap_cells)

          render json: WebApi::V1::HeatmapCellSerializer.new(
            heatmap_cells,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def apply_filters(heatmap_cells)
          heatmap_cells.where(unit: params[:unit] || 'inputs')

          if params[:row_category_type].present?
            row_type = category_type_to_item_type(params[:row_category_type])
            heatmap_cells = heatmap_cells.where(row_type:)
            if params[:row_category_id].present?
              row_id = category_to_item_id(params[:row_category_type], params[:row_category_id])
              heatmap_cells = heatmap_cells.where(row_id:)
            end
          end

          if params[:column_category_type].present?
            column_type = category_type_to_item_type(params[:column_category_type])
            heatmap_cells = heatmap_cells.where(column_type:)
            if params[:column_category_id].present?
              column_id = category_to_item_id(params[:column_category_type], params[:column_category_id])
              heatmap_cells = heatmap_cells.where(column_id:)
            end
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
            CustomFieldOption.name
          end
        end

        def category_to_item_id(category_type, category_id)
          case category_type
          when 'tags'
            raise "Don't supply a category_id if the category_type is tags"
          when 'user_custom_field', 'input_custom_field'
            CustomFieldOption.where(custom_field_id: category_id)
          end
        end

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def generate_heatmap_cells
          HeatmapGenerationJob.perform_later(@analysis)
        end
      end
    end
  end
end
