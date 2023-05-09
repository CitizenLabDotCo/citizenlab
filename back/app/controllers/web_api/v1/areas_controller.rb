# frozen_string_literal: true

class WebApi::V1::AreasController < ApplicationController
  before_action :set_area, except: %i[index create]
  before_action :set_side_effects_service, only: %i[create update reorder destroy]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    areas_filterer = AreasFilteringService.new
    @areas = policy_scope(Area)
    @areas = areas_filterer.filter(@areas, params: params, current_user: current_user)
    @areas = @areas.order(created_at: :desc)
    @areas = paginate @areas

    include_static_pages = params[:include]&.split(',')&.include?('static_pages')

    if include_static_pages
      render json: linked_json(
        @areas.includes([static_pages: :nav_bar_item]),
        WebApi::V1::AreaSerializer,
        include: [:static_pages],
        params: fastjson_params(include_static_pages: true)
      )
      return
    end

    render json: linked_json(@areas, WebApi::V1::AreaSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::AreaSerializer.new(@area, params: fastjson_params).serializable_hash.to_json
  end

  def create
    @area = Area.new(area_params)
    authorize @area

    @side_fx_service.before_create(@area, current_user)
    if @area.save
      @side_fx_service.after_create(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(
        @area,
        params: fastjson_params
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @area.assign_attributes area_params
    authorize @area
    @side_fx_service.before_update(@area, current_user)
    if @area.save
      @side_fx_service.after_update(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(
        @area,
        params: fastjson_params
      ).serializable_hash.to_json, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @side_fx_service.before_destroy(@area, current_user)
    if @area.destroy
      @side_fx_service.after_destroy(@area, current_user)
      head :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    @side_fx_service.before_update(@area, current_user)
    if @area.insert_at(permitted_attributes(@area)[:ordering])
      @side_fx_service.after_update(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(@area.reload, params: fastjson_params).serializable_hash.to_json, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_area
    @area = Area.find(params[:id])
    authorize @area
  end

  def area_params
    params.require(:area).permit(
      :ordering,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def set_side_effects_service
    @side_fx_service = SideFxAreaService.new
  end
end
