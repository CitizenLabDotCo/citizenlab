# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class TagsController < ApplicationController
        include FilterParamsExtraction
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          @tags = @analysis.tags
            .order(created_at: :desc)

          inputs_count_by_tag = TagCounter.new(@analysis, tags: @tags).counts_by_tag
          filtered_inputs_count_by_tag = TagCounter.new(@analysis, tags: @tags, filters: filters).counts_by_tag

          inputs_total = TagCounter.new(@analysis, tags: @tags, filters: {}).total_count
          filtered_inputs_total = TagCounter.new(@analysis, tags: @tags, filters: filters).total_count
          inputs_without_tags = TagCounter.new(@analysis, tags: @tags, filters: { tag_ids: [nil] }).total_count
          filtered_inputs_without_tags = TagCounter.new(@analysis, tags: @tags, filters: filters.merge(tag_ids: [nil])).total_count

          render json: WebApi::V1::TagSerializer.new(
            @tags,
            params: {
              inputs_count_by_tag: inputs_count_by_tag,
              filtered_inputs_count_by_tag: filtered_inputs_count_by_tag,
              **jsonapi_serializer_params
            },
            meta: {
              inputs_total: inputs_total,
              filtered_inputs_total: filtered_inputs_total,
              inputs_without_tags: inputs_without_tags,
              filtered_inputs_without_tags: filtered_inputs_without_tags
            }
          ).serializable_hash
        end

        def create
          @tag = @analysis.tags.new(tag_params)
          @tag.tag_type = 'custom'
          if @tag.save
            side_fx_service.after_create(@tag, current_user)
            render json: WebApi::V1::TagSerializer.new(
              @tag,
              params: {
                filtered_inputs_count_by_tag: { @tag.id => 0 },
                inputs_count_by_tag: { @tag.id => 0 },
                **jsonapi_serializer_params
              }
            ).serializable_hash, status: :created
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @tag = @analysis.tags.find(params[:id])

          if @tag.update(tag_params)
            side_fx_service.after_update(@tag, current_user)

            inputs_count_by_tag = TagCounter.new(@analysis, tags: [@tag]).counts_by_tag
            filtered_inputs_count_by_tag = TagCounter.new(@analysis, tags: [@tag], filters: filters).counts_by_tag

            render json: WebApi::V1::TagSerializer.new(
              @tag,
              params: {
                inputs_count_by_tag: inputs_count_by_tag,
                filtered_inputs_count_by_tag: filtered_inputs_count_by_tag,
                **jsonapi_serializer_params
              }
            ).serializable_hash, status: :ok
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @tag = @analysis.tags.find(params[:id])
          side_fx_service.before_destroy(@tag, current_user)
          if @tag.destroy
            side_fx_service.after_destroy(@tag, current_user)
            head :ok
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def side_fx_service
          @side_fx_service ||= SideFxTagService.new
        end

        def tag_params
          params.require(:tag).permit(:name)
        end
      end
    end
  end
end
