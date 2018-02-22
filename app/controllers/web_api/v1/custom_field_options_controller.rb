class WebApi::V1::CustomFieldOptionsController < ApplicationController
  before_action :set_option, only: [:show, :update, :destroy]
  before_action :set_custom_field, only: [:index, :create]

  def index
    @options = policy_scope(CustomFieldOption)
      .where(custom_field: @custom_field)
      .order(:ordering)
    render json: @options
  end

  def show
    render json: @option
  end

  def create
    @option = CustomFieldOption.new(option_create_params)
    @option.custom_field = @custom_field
    authorize @option

    SideFxCustomFieldOptionService.new.before_create(@option, current_user)

    if @option.save
      SideFxCustomFieldOptionService.new.after_create(@option, current_user)
      render json: @option, status: :created
    else
      render json: { errors: @option.errors.details }, status: :unprocessable_entity
    end
  end


  def update
    if @option.update(option_update_params)
      SideFxCustomFieldOptionService.new.after_update(@option, current_user)
      render json: @option.reload, status: :ok
    else
      render json: { errors: @option.errors.detauls }, status: :unprocessable_entity
    end
  end


  def destroy
    SideFxCustomFieldOptionService.new.before_destroy(@option, current_user)
    frozen_option = @option.destroy
    if frozen_option
      SideFxCustomFieldOptionService.new.after_destroy(frozen_option, current_user)
      head :ok
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

  def option_create_params
    params.require(:custom_field_option).permit(
      :key,
      :ordering,
      title_multiloc: I18n.available_locales,
    )
  end

  def option_update_params
    params.require(:custom_field_option).permit(
      :ordering,
      title_multiloc: I18n.available_locales,
    )
  end

  def secure_controller?
    false
  end
end
