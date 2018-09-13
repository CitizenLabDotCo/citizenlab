class WebApi::V1::BasketsController < ApplicationController
  before_action :set_basket, only: [:show, :update, :destroy]

  def show
    render json: @basket
  end

  def create
    @basket = Basket.new(basket_params)
    authorize @basket

    # SideFxAreaService.new.before_create(@area, current_user)
    if @basket.save
      # SideFxAreaService.new.after_create(@area, current_user)
      render json: @basket, status: :created
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @basket.assign_attributes basket_params
    # SideFxAreaService.new.before_update(@area, current_user)
    if @basket.save
      # SideFxAreaService.new.after_update(@area, current_user)
      render json: @basket, status: :ok
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    # SideFxAreaService.new.before_destroy(@basket, current_user)
    basket = @basket.destroy
    if basket.destroyed?
      # SideFxAreaService.new.after_destroy(basket, current_user)
      head :ok
    else
      head 500
    end
  end


  private

  def set_basket
    @basket = Basket.find(params[:id])
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
