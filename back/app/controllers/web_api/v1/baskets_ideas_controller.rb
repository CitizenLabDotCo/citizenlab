# frozen_string_literal: true

class WebApi::V1::BasketsIdeasController < ApplicationController
  def index
    baskets_ideas = paginate policy_scope(basket.baskets_ideas).includes(:idea)
    render json: WebApi::V1::BasketsIdeaSerializer.new(
      baskets_ideas,
      params: jsonapi_serializer_params,
      include: %i[idea]
    ).serializable_hash
  end

  def show
    render json: WebApi::V1::BasketsIdeaSerializer.new(
      baskets_idea,
      params: jsonapi_serializer_params,
      include: %i[idea]
    ).serializable_hash
  end

  def create
    baskets_idea = BasketsIdea.new baskets_idea_params_for_create
    baskets_idea.basket = basket
    authorize baskets_idea

    SideFxBasketsIdeaService.new.before_create baskets_idea, current_user
    if baskets_idea.save
      SideFxBasketsIdeaService.new.after_create baskets_idea, current_user
      render json: WebApi::V1::BasketsIdeaSerializer.new(
        baskets_idea,
        params: jsonapi_serializer_params,
        include: %i[idea]
      ).serializable_hash, status: :created
    else
      render json: { errors: baskets_idea.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    baskets_idea.assign_attributes baskets_idea_params_for_update
    authorize baskets_idea
    SideFxBasketsIdeaService.new.before_update baskets_idea, current_user
    if baskets_idea.save
      SideFxBasketsIdeaService.new.after_update baskets_idea, current_user
      render json: WebApi::V1::BasketsIdeaSerializer.new(
        baskets_idea,
        params: jsonapi_serializer_params,
        include: %i[idea]
      ).serializable_hash, status: :ok
    else
      render json: { errors: baskets_idea.errors.details }, status: :unprocessable_entity
    end
  end

  def upsert
    # 1. Create or get basket
    idea = Idea.find(params[:idea_id])
    participation_context = ParticipationContextService.new.get_participation_context(idea.project)

    basket = Basket.find_or_initialize_by(
      participation_context: participation_context,
      user: current_user
    )
    if basket.new_record?
      if basket.save
        SideFxBasketService.new.after_create basket, current_user
      else
        render json: { errors: basket.errors.details }, status: :unprocessable_entity
        return
      end
    end

    # 2. Create, update or delete the baskets_idea
    baskets_idea = BasketsIdea.find_or_initialize_by(
      basket: basket,
      idea: idea
    )
    record_is_new = baskets_idea.new_record?
    authorize baskets_idea
    baskets_idea.assign_attributes baskets_idea_params_for_update

    if baskets_idea.votes.nil? || baskets_idea.votes == 0
      baskets_idea.destroy
      if baskets_idea.destroyed?
        SideFxBasketsIdeaService.new.after_destroy baskets_idea, current_user
      end
    elsif baskets_idea.save
      if record_is_new
        SideFxBasketsIdeaService.new.after_create baskets_idea, current_user
      else
        SideFxBasketsIdeaService.new.after_update baskets_idea, current_user
      end
    else
      render json: { errors: baskets_idea.errors.details }, status: :unprocessable_entity
      return
    end

    # Always return a response - even if trying to delete a record that does not exist
    render json: WebApi::V1::BasketsIdeaSerializer.new(
      baskets_idea,
      params: jsonapi_serializer_params,
      include: %i[idea]
    ).serializable_hash, status: :ok
  end

  def destroy
    SideFxBasketsIdeaService.new.before_destroy baskets_idea, current_user
    baskets_idea.destroy
    if baskets_idea.destroyed?
      SideFxBasketsIdeaService.new.after_destroy baskets_idea, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def baskets_idea
    @baskets_idea ||= BasketsIdea.find(params[:id]).tap do |baskets_idea|
      authorize baskets_idea
    end
  end

  def basket
    @basket = Basket.find params[:basket_id]
  end

  def baskets_idea_params_for_create
    params.require(:baskets_idea).permit(:idea_id, :votes)
  end

  def baskets_idea_params_for_update
    params.require(:baskets_idea).permit(:votes)
  end
end
