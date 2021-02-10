module Tagging
  module WebApi
    module V1
      class TaggingsController < ApplicationController
        before_action :set_tagging, only: %i[show destroy update]
        skip_after_action :verify_authorized, only: [:generate, :cancel_generate]

        def index
          @taggings = policy_scope(Tagging)

          @taggings = @taggings.where(idea_id: params['idea_ids']) if params['idea_ids']
          @taggings = @taggings.where(assignment_method: params['assignment_method']) if params['assignment_method']

          render json: WebApi::V1::TaggingSerializer.new(
            @taggings,
            params: fastjson_params,
            includes: [:tag]
          ).serialized_json, status: :ok
        end

        def show
          render json:  WebApi::V1::TaggingSerializer.new(
            @tagging,
            params: fastjson_params,
            includes: [:tag]
          ).serialized_json
        end

        def create
          @tagging = Tagging.new(permitted_attributes(Tagging))
          @tagging.assignment_method = :manual
          @tagging.confidence_score = 1
          authorize @tagging

          SideFxTaggingService.new.before_create(@tagging, current_user)
          if @tagging.save
            SideFxTaggingService.new.after_create(@tagging, current_user)
            render json: WebApi::V1::TaggingSerializer.new(
              @tagging,
              params: fastjson_params,
              includes: [:tag]
            ).serialized_json, status: :created
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          if params['assignment_method'] == 'manual' && @tagging.assignment_method == 'automatic'
            @tagging.confidence_score = 1
            @tagging.assignment_method = 'manual'
            authorize @tagging
            if @tagging.save
              render json: WebApi::V1::TaggingSerializer.new(
                @tagging,
                params: fastjson_params
              ).serialized_json, status: :ok
            else
              render json: { errors: @tag.errors.details }, status: :unprocessable_entity
            end
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          SideFxTaggingService.new.before_destroy(@tagging, current_user)
          tagging = @tagging.destroy
          if tagging.destroyed?
            SideFxTaggingService.new.after_destroy(tagging, current_user)
            head :ok
          else
            head 500
          end
        end

        def generate
          AutomaticTaggingService.new.cancel_tasks

          tags = params['tags']
          tag_ids = params['tag_ids']
          @new_tags = tags ? tags.map { |tag| Tag.create(title_multiloc: { current_user.locale => tag }) } : []
          @old_tags = tag_ids ? Tag.where(id: tag_ids) : []

          @ideas = policy_scope(Idea)
          @ideas = @ideas.where(project_id: params[:projects]) if params[:projects].present?
          @ideas = @ideas.where(id: params[:idea_ids]) if params[:idea_ids].present?

          @ideas = @ideas.order_new

          Tagging.automatic.where(idea: @ideas).destroy_all

          @res = NLP::TaggingSuggestionService.new.suggest(
            @ideas,
            @new_tags + @old_tags,
            current_user.locale
          )
          if @res
            AutomaticTaggingService.new.create_pending_tasks @res['batches']

            head :ok
          else
            render json: { errors: ['NO'] }, status: :unprocessable_entity
          end
        end

        def cancel_generate
          head AutomaticTaggingService.new.cancel_tasks
        end

        private

        def set_tagging
          @tagging = Tagging.find(params[:id])
          authorize @tagging
        end

        def secure_controller?
          false
        end
      end
    end
  end
end
