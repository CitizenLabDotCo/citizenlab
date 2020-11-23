module Tagging
  module WebApi
    module V1
      class TaggingsController < ApplicationController
        before_action :set_tagging, only: %i[show destroy]
        skip_after_action :verify_authorized, only: [:generate]

        def index
          @taggings = policy_scope(Tagging)

          @taggings = @taggings.where(idea_id: params["idea_ids"]) if params["idea_ids"]
          @taggings = @taggings.where(assignment_method: params["assignment_method"]) if params["assignment_method"]

          render json: WebApi::V1::TaggingSerializer.new(
            @taggings,
            params: fastjson_params,
            include: [:tag]
          ).serialized_json, status: :ok
        end

        def show
          render json:  WebApi::V1::TaggingSerializer.new(
            @tagging,
            params: fastjson_params,
            include: [:tag]
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
              include: [:tag]
              ).serialized_json, status: :created
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
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
          Tagging.automatic.destroy_all

          tags = params["tags"]
          tag_ids = params["tag_ids"]
          @new_tags = tags ? tags.map {|tag, index| { title_multiloc: tag, id: index } } : []
          @old_tags = tag_ids ? Tag.where(tag_id: tag_ids) : []

          NLP::TaggingSuggestionService.new.suggest(
            policy_scope(Idea).where(id: params['idea_ids']),
            @new_tags + policy_scope(Tag).where(id: params['tag_ids']),
            current_user.locale
          ).each do |document|
            idea = Idea.find(document['id'])
            document['predicted_labels'].each{ |label|
              begin
                tag = Tag.find(label['id'])
              rescue ActiveRecord::RecordNotFound => _
                Tag.create(title_multiloc: params['tags'][label['id']])
              end
              Tagging.create(
                tag: tag,
                idea: idea,
                assignment_method: :automatic,
                confidence_score: label['confidence']
              )
            }
          end
          render json: WebApi::V1::TaggingSerializer.new(Tagging.automatic.all, params: fastjson_params, include: [:tag]).serialized_json, status: :ok
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
