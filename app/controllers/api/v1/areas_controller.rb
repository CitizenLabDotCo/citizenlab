class Api::V1::AreasController < ApplicationController
  before_action :set_area, only: [:show, :update, :destroy]

  def index
    @areas = policy_scope(Area).page(params[:page])
    render json: @areas
  end

  def show
    render json: @area
  end

  private

  def set_area
    @area = Area.find(params[:id])
    authorize @area
  end

  def secure_controller?
    false
  end
end
