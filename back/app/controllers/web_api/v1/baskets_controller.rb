# frozen_string_literal: true

class WebApi::V1::BasketsController < ApplicationController
  def show
    render json: WebApi::V1::BasketSerializer.new(
      basket,
      params: jsonapi_serializer_params,
      include: %i[baskets_ideas ideas]
    ).serializable_hash
  end

  def update
    basket.assign_attributes basket_update_attributes
    save_params = {}
    save_params[:context] = [:basket_submission] if basket.submitted?
    if basket_update_attributes.include? 'submitted_at'
      Factory.instance.voting_method_for(basket.phase).update_before_submission_change! basket
    end
    if basket.save(**save_params)
      SideFxBasketService.new.after_update basket, current_user
      render json: WebApi::V1::BasketSerializer.new(
        basket,
        params: jsonapi_serializer_params,
        include: %i[baskets_ideas]
      ).serializable_hash, status: :ok
    else
      render json: { errors: basket.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    basket.destroy
    if basket.destroyed?
      SideFxBasketService.new.after_destroy basket, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def basket
    @basket ||= Basket.find(params[:id]).tap do |basket|
      authorize basket
    end
  end

  def basket_update_attributes
    attributes = params.require(:basket).permit(:submitted).to_h
    map_submission attributes
  end

  def map_submission(attributes)
    attributes['submitted_at'] = attributes['submitted'] ? Time.now : nil
    attributes.delete 'submitted'
    attributes
  end
end
