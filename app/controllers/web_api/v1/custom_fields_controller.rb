class WebApi::V1::CustomFieldsController < ApplicationController
  before_action :set_custom_field, only: [:show, :update, :destroy]
  before_action :set_resource_type, only: [:index, :schema, :create]

  def index
    @custom_fields = policy_scope(CustomField)
      .where(resource_type: @resource_type)
      .order(:ordering)
    render json: @custom_fields
  end

  def schema
    authorize :custom_field
    fields = CustomField.fields_for(@resource_type.constantize)

    service = CustomFieldService.new
    json_schema_multiloc = service.fields_to_json_schema_multiloc(Tenant.current, fields)
    ui_schema_multiloc = service.fields_to_ui_schema_multiloc(Tenant.current, fields)

    render json: {json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc}
  end

  def show
    render json: @custom_field
  end


  def create
    @custom_field = CustomField.new(custom_field_create_params)
    @custom_field.resource_type = @resource_type
    authorize @custom_field

    SideFxCustomFieldService.new.before_create(@custom_field, current_user)

    if @custom_field.save
      SideFxCustomFieldService.new.after_create(@custom_field, current_user)
      render json: @custom_field, status: :created
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end


  def update
    if @custom_field.update(custom_field_update_params)
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: @custom_field.reload, status: :ok
    else
      render json: { errors: @custom_field.errors.detauls }, status: :unprocessable_entity
    end
  end


  def destroy
    SideFxCustomFieldService.new.before_destroy(@custom_field, current_user)
    frozen_custom_field = @custom_field.destroy
    if frozen_custom_field
      SideFxCustomFieldService.new.after_destroy(frozen_custom_field, current_user)
      head :ok
    else
      head 500
    end
  end

  private

  def set_resource_type
    @resource_type = params[:resource_type]
    raise RuntimeError, "must not be blank" if @resource_type.blank?
  end

  def set_custom_field
    @custom_field = CustomField.find(params[:id])
    authorize @custom_field
  end

  def custom_field_create_params
    params.require(:custom_field).permit(
      :key,
      :input_type,
      :required,
      :ordering,
      title_multiloc: I18n.available_locales,
      description_multiloc: I18n.available_locales
    )
  end

  def custom_field_update_params
    params.require(:custom_field).permit(
      :required,
      :ordering,
      title_multiloc: I18n.available_locales,
      description_multiloc: I18n.available_locales
    )
  end

  def secure_controller?
    false
  end
end
