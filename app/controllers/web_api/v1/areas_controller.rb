class WebApi::V1::AreasController < ApplicationController
  before_action :set_area, only: [:show, :update, :destroy]

  def index
    @areas = policy_scope(Area)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @areas
  end

  def show
    render json: @area
  end

  def create
    @area = Area.new(area_params)
    authorize @area

    SideFxAreaService.new.before_create(@area, current_user)
    if @area.save
      SideFxAreaService.new.after_create(@area, current_user)
      render json: @area, status: :created
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    SideFxAreaService.new.before_update(@area, current_user)
    @area.assign_attributes area_params
    if @area.save
      SideFxAreaService.new.after_update(@area, current_user)
      render json: @area, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxAreaService.new.before_destroy(@area, current_user)
    area = @area.destroy
    if area.destroyed?
      SideFxAreaService.new.after_destroy(area, current_user)
      head :ok
    else
      head 500
    end
  end


  private

  def set_area
    @area = Area.find(params[:id])
    authorize @area
  end

  def area_params
    params.require(:area).permit(
      title_multiloc: I18n.available_locales,
      description_multiloc: I18n.available_locales
    )
  end

  def secure_controller?
    false
  end
end
