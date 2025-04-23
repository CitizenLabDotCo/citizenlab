# frozen_string_literal: true

class WebApi::V1::CustomFieldOptionsController < ApplicationController
  before_action :set_option, only: %i[show update reorder destroy]
  before_action :set_custom_field, only: %i[index create]
  skip_before_action :authenticate_user

  def index
    @options = policy_scope(CustomFieldOption).where(custom_field: @custom_field).order(:ordering).includes(:image)
    render json: WebApi::V1::CustomFieldOptionSerializer.new(@options, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::CustomFieldOptionSerializer.new(@option, params: jsonapi_serializer_params).serializable_hash
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
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
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
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @option.insert_at(permitted_attributes(@option)[:ordering])
      SideFxCustomFieldOptionService.new.after_update(@option, current_user)
      render json: WebApi::V1::CustomFieldOptionSerializer.new(
        @option.reload,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    CustomFields::Options::DestroyService.new.destroy!(@option, current_user)
    head :ok
  rescue ActiveRecord::RecordNotDestroyed
    @option.errors.present? ? send_unprocessable_entity(@option) : raise
  end

  private

  def set_custom_field
    @custom_field = CustomField.find(params[:custom_field_id])
  end

  def set_option
    @option = CustomFieldOption.find(params[:id])
    authorize @option
  end
end
