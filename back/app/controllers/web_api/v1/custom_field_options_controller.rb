class WebApi::V1::CustomFieldOptionsController < ApplicationController
  before_action :set_option, only: [:show, :update, :reorder, :destroy]
  before_action :set_custom_field, only: [:index, :create]

  def index
    @options = policy_scope(CustomFieldOption).where(custom_field: @custom_field).order(:ordering)
    render json: WebApi::V1::CustomFieldOptionSerializer.new(@options, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::CustomFieldOptionSerializer.new(@option, params: fastjson_params).serialized_json
  end

  def create
    @option = CustomFieldOption.new(permitted_attributes(CustomFieldOption))
    @option.custom_field = @custom_field
    authorize @option

    SideFxCustomFieldOptionService.new.before_create(@option, current_user)

    if @option.save
      SideFxCustomFieldOptionService.new.after_create(@option, current_user)
      render json: WebApi::V1::CustomFieldOptionSerializer.new(
        @option,
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end


  def update
    @option.assign_attributes permitted_attributes(@option)
    authorize @option
    if @option.save
      SideFxCustomFieldOptionService.new.after_update(@option, current_user)
      render json: WebApi::V1::CustomFieldOptionSerializer.new(
        @option.reload,
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @option.insert_at(permitted_attributes(@option)[:ordering])
      SideFxCustomFieldOptionService.new.after_update(@option, current_user)
      render json: WebApi::V1::CustomFieldOptionSerializer.new(
        @option.reload,
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end


  def destroy
    SideFxCustomFieldOptionService.new.before_destroy(@option, current_user)
    frozen_option = @option.destroy
    if frozen_option
      SideFxCustomFieldOptionService.new.after_destroy(frozen_option, current_user)
      head :ok
    elsif @option.errors
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    else
      head 500
    end
  end

  private

  def set_custom_field
    @custom_field = CustomField.find(params[:custom_field_id])
  end

  def set_option
    @option = CustomFieldOption.find(params[:id])
    authorize @option
  end

  def secure_controller?
    false
  end
end
