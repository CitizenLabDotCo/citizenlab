module Clusterings
  class WebApi::V1::ClusteringsController < ApplicationController
    before_action :set_clustering, only: %i[show update destroy]
    skip_before_action :authenticate_user

    def index
      @clusterings = paginate policy_scope(Clustering)

      render json: linked_json(@clusterings, WebApi::V1::ClusteringSerializer, params: fastjson_params)
    end

    def show
      render json: WebApi::V1::ClusteringSerializer.new(@clustering, params: fastjson_params).serialized_json
    end

    def create
      @clustering = Clustering.new(clustering_params)

      pa = params[:clustering]

      options = {}
      options[:drop_empty] = pa[:drop_empty] != 'false'

      @ideas = policy_scope(Idea)
      @ideas = @ideas.with_some_topics(Topic.where(id: pa[:topics])) if pa[:topics].present?
      @ideas = @ideas.with_some_areas(pa[:areas]) if pa[:areas].present?
      @ideas = @ideas.in_phase(pa[:phases]) if pa[:phases].present?
      @ideas = @ideas.where(project_id: pa[:projects]) if pa[:projects].present?
      @ideas = @ideas.where(author_id: pa[:author]) if pa[:author].present?
      @ideas = @ideas.where(idea_status_id: pa[:idea_statuses]) if pa[:idea_statuses].present?
      @ideas = @ideas.search_by_all(pa[:search]) if pa[:search].present?
      if pa[:publication_status].present?
        @ideas = @ideas.where(publication_status: pa[:publication_status])
      else
        @ideas = @ideas.where(publication_status: 'published')
      end
      if (pa[:filter_trending] == 'true') && !pa[:search].present?
        @ideas = trending_idea_service.filter_trending @ideas
      end
      @ideas = @ideas.where('upvotes_count >= ?', pa[:minimal_upvotes]) if pa[:minimal_upvotes].present?
      @ideas = @ideas.where('downvotes_count >= ?', pa[:minimal_downvotes]) if pa[:minimal_downvotes].present?
      @ideas = @ideas.where('(upvotes_count + downvotes_count) >= ?', pa[:minimal_total_votes]) if pa[:minimal_total_votes].present?

      begin
        @clustering.structure = NLP::ClusteringService.new.build_structure(
          pa[:levels],
          @ideas,
          options
        )
      rescue ClErrors::TransactionError => e
        render json: { errors: { base: [{ error: e.error_key }] } }, status: :unprocessable_entity
        skip_authorization
        return
      end

      authorize @clustering

      SideFxClusteringService.new.before_create(@clustering, current_user)
      if @clustering.save
        SideFxClusteringService.new.after_create(@clustering, current_user)
        render json: WebApi::V1::ClusteringSerializer.new(
          @clustering,
          params: fastjson_params
        ).serialized_json, status: :created
      else
        render json: { errors: @clustering.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      @clustering.assign_attributes clustering_params
      authorize @clustering
      SideFxClusteringService.new.before_update(@clustering, current_user)
      if @clustering.save
        SideFxClusteringService.new.after_update(@clustering, current_user)
        render json: WebApi::V1::ClusteringSerializer.new(
          @clustering,
          params: fastjson_params
        ).serialized_json, status: :ok
      else
        render json: { errors: @clustering.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      SideFxClusteringService.new.before_destroy(@clustering, current_user)
      clustering = @clustering.destroy
      if clustering.destroyed?
        SideFxClusteringService.new.after_destroy(clustering, current_user)
        head :ok
      else
        head 500
      end
    end

    private

    def set_clustering
      @clustering = Clustering.find(params[:id])
      authorize @clustering
    end

    def clustering_params
      all_structures = params.require(:clustering).fetch(:structure, nil).try(:permit!)
      params.require(:clustering).permit(
        title_multiloc: CL2_SUPPORTED_LOCALES
      ).merge(structure: all_structures)
    end
  end
end
