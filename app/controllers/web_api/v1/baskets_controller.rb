class WebApi::V1::BasketsController < ApplicationController
  before_action :set_basket, only: [:show, :update, :destroy]

  def show
    render json: @basket, include: ['ideas', 'baskets_ideas']
  end

  def create
    @basket = Basket.new basket_params
    authorize @basket

    if @basket.save
      SideFxAreaService.new.after_create @basket, current_user
      render json: @basket, status: :created
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @basket.assign_attributes basket_params
    if @basket.save
      SideFxBasketService.new.after_update @basket, current_user
      render json: @basket, status: :ok
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
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
