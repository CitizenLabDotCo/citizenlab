class WebApi::V1::CustomFieldsController < ApplicationController
  before_action :set_custom_field, only: [:show, :update, :reorder, :destroy]
  before_action :set_resource_type, only: [:index, :schema, :create]

  def index
    @custom_fields = policy_scope(CustomField)
      .where(resource_type: @resource_type)
      .order(:ordering)

    @custom_fields = @custom_fields.where(input_type: params[:input_types]) if params[:input_types]
  
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_fields, params: fastjson_params).serialized_json
  end

  def schema
    authorize :custom_field
    fields = CustomField.fields_for(@resource_type)

    service = CustomFieldService.new
    json_schema_multiloc = service.fields_to_json_schema_multiloc(Tenant.current, fields)
    ui_schema_multiloc = service.fields_to_ui_schema_multiloc(Tenant.current, fields)

    mark_unchangeable_fields_as_disabled(ui_schema_multiloc) if current_user

    render json: {json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc}
  end

  def show
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
  end


  def create
    @custom_field = CustomField.new permitted_attributes(CustomField)
    @custom_field.resource_type = @resource_type
    authorize @custom_field

    SideFxCustomFieldService.new.before_create @custom_field, current_user

    if @custom_field.save
      SideFxCustomFieldService.new.after_create @custom_field, current_user
      render json: WebApi::V1::CustomFieldSerializer.new(
        @custom_field, 
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end


  def update
    @custom_field.assign_attributes permitted_attributes(@custom_field)
    authorize @custom_field
    if @custom_field.save
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: WebApi::V1::CustomFieldSerializer.new(
        @custom_field.reload, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @custom_field.errors.detauls }, status: :unprocessable_entity
    end
  end

  def reorder
    if @custom_field.insert_at(permitted_attributes(@custom_field)[:ordering])
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: WebApi::V1::CustomFieldSerializer.new(
        @custom_field.reload, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end


  def destroy
    SideFxCustomFieldService.new.before_destroy(@custom_field, current_user)
    frozen_custom_field = @custom_field.destroy
    if frozen_custom_field
      SideFxCustomFieldService.new.after_destroy(frozen_custom_field, current_user)
      head :ok
    elsif @custom_field.errors
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
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

  def secure_controller?
    false
  end

  def mark_unchangeable_fields_as_disabled ui_schema_multiloc
    sso_service = SingleSignOnService.new
    unchangeable_custom_fields = sso_service.custom_fields_user_cant_change(current_user).map(&:to_s)
    ui_schema_multiloc.each do |_locale, ui_schema|
      ui_schema
        .keys
        .select{|key| unchangeable_custom_fields.include? key}
        .each{|key| ui_schema[key]["ui:disabled"] = true}
    end
  end
end
