# frozen_string_literal: true

class WebApi::V1::BasketsController < ApplicationController
  before_action :set_basket, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def show
    render json: WebApi::V1::BasketSerializer.new(
      @basket,
      params: jsonapi_serializer_params,
      include: %i[baskets_ideas ideas]
    ).serializable_hash
  end

  def create
    @basket = Basket.new basket_params
    authorize @basket

    save_params = {}
    save_params[:context] = [:basket_submission] if @basket.submitted_at.present?
    if @basket.save save_params
      SideFxBasketService.new.after_create @basket, current_user
      render json: WebApi::V1::BasketSerializer.new(
        @basket,
        params: jsonapi_serializer_params,
        include: %i[baskets_ideas]
      ).serializable_hash, status: :created
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    attributes = basket_params.to_h
    if attributes.key? 'baskets_ideas_attributes'
      attributes['baskets_ideas_attributes'].each do |baskets_idea_attrs|
        update_basket_idea = @basket.baskets_ideas.find_by(idea_id: baskets_idea_attrs['idea_id'])
        baskets_idea_attrs['id'] = update_basket_idea.id if update_basket_idea
      end
      delete_idea_ids = @basket.baskets_ideas.where.not(idea_id: attributes['baskets_ideas_attributes'].pluck('idea_id'))
      attributes['baskets_ideas_attributes'] += delete_idea_ids.map do |delete_basket_idea|
        { 'id' => delete_basket_idea.id, '_destroy' => true }
      end
    end
    # @basket.baskets_ideas.each(&:mark_for_destruction) if basket_params.key? 'baskets_ideas_attributes' # https://stackoverflow.com/a/61460292/3585671
    @basket.assign_attributes attributes
    save_params = {}
    save_params[:context] = [:basket_submission] if @basket.submitted_at.present?
    if @basket.save(save_params)
      SideFxBasketService.new.after_update @basket, current_user
      render json: WebApi::V1::BasketSerializer.new(
        @basket,
        params: jsonapi_serializer_params,
        include: %i[baskets_ideas]
      ).serializable_hash, status: :ok
    else
      byebug
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    basket = @basket.destroy
    if basket.destroyed?
      SideFxBasketService.new.after_destroy basket, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_basket
    @basket = Basket.find params[:id]
    authorize @basket
  end

  def basket_params
    params.require(:basket).permit(
      :submitted_at,
      :user_id,
      :participation_context_id,
      :participation_context_type,
      baskets_ideas_attributes: %i[idea_id votes]
    )
  end
end
