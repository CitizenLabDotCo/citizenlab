class WebApi::V1::BasketsController < ApplicationController
  before_action :set_basket, only: [:show, :update, :destroy]

  def show
    render json: WebApi::V1::BasketSerializer.new(
      @basket,
      params: fastjson_params,
      include: [:ideas]
    ).serialized_json
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
        params: fastjson_params,
        ).serialized_json, status: :created
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    new_idea_ids = basket_params[:idea_ids]
    begin
      ActiveRecord::Base.transaction do
        if new_idea_ids
          # Remove and add ideas to the basket.
          #
          # The reason we don't simply update on idea_ids is
          # to keep the counter correct.
          old_idea_ids = @basket.idea_ids
          ideas_to_add = new_idea_ids - old_idea_ids
          ideas_to_rmv = old_idea_ids - new_idea_ids
          @basket.baskets_ideas.where(idea_id: ideas_to_rmv).each(&:destroy!)
          ideas_to_add.each{ |idea_id| @basket.baskets_ideas.create!(idea_id: idea_id) }
        end
        @basket.assign_attributes basket_params.except(:idea_ids)
        save_params = {}
        save_params[:context] = [:basket_submission] if @basket.submitted_at.present?
        raise ClErrors::TransactionError.new(error_key: :unprocessable_basket) if !@basket.save(save_params)
        SideFxBasketService.new.after_update @basket, current_user
      end
      render json: WebApi::V1::BasketSerializer.new(
        @basket,
        params: fastjson_params,
        ).serialized_json, status: :ok
    rescue ClErrors::TransactionError => e
      case e.error_key
      when :unprocessable_basket
        render json: { errors: @basket.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end

  def destroy
    basket = @basket.destroy
    if basket.destroyed?
      SideFxBasketService.new.after_destroy basket, current_user
      head :ok
    else
      head 500
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
      idea_ids: []
    )
  end

  def secure_controller?
    false
  end
end
