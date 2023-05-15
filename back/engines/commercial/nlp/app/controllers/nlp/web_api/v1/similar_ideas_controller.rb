# frozen_string_literal: true

module NLP
  module WebApi
    module V1
      class SimilarIdeasController < ApplicationController
        skip_before_action :authenticate_user

        SIMILARITY_TRESHOLD = 0.15

        def index
          idea = Idea.find params[:idea_id]
          authorize idea, :show?

          service = NLP::SimilarityService.new
          similarities = service.similarity(
            Tenant.current.id, idea,
            idea_ids: policy_scope(Idea).ids,
            min_score: SIMILARITY_TRESHOLD
          )
          @ideas = policy_scope(Idea.where(id: similarities.pluck(:idea_id)))
          @ideas = paginate @ideas

          render json: linked_json(@ideas, ::WebApi::V1::SimilarIdeaSerializer, params: jsonapi_serializer_params)
        end
      end
    end
  end
end
