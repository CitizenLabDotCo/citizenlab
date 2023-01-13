# frozen_string_literal: true

class WebApi::V1::UserCustomFieldsController < ApplicationController
  before_action :set_custom_field, only: %i[show update reorder]
  before_action :set_resource_type, only: %i[index schema json_forms_schema]
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped

  def index
    @custom_fields = UserCustomFieldPolicy::Scope.new(current_user, CustomField.all).resolve
      .where(resource_type: @resource_type)
      .order(:ordering)
    @custom_fields = @custom_fields.where(input_type: params[:input_types]) if params[:input_types]

    render json: serialize_custom_fields(@custom_fields, params: fastjson_params)
  end

  def schema
    authorize :custom_field, policy_class: UserCustomFieldPolicy
    fields = CustomField.with_resource_type(@resource_type)
    json_schema_multiloc = custom_field_service.fields_to_json_schema_multiloc(AppConfiguration.instance, fields)
    ui_schema_multiloc = get_ui_schema_multiloc(fields)

    render json: { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  def json_forms_schema
    authorize :custom_field, policy_class: UserCustomFieldPolicy
    fields = CustomField.with_resource_type(@resource_type)

    render json: user_ui_and_json_multiloc_schemas(fields)
  end

  def show
    render json: serialize_custom_fields(@custom_field, params: fastjson_params)
  end

  def update
    @custom_field.assign_attributes custom_field_params(@custom_field)
    authorize @custom_field, policy_class: UserCustomFieldPolicy
    SideFxCustomFieldService.new.before_update @custom_field, current_user
    if @custom_field.save
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: serialize_custom_fields(@custom_field.reload, params: fastjson_params), status: :ok
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @custom_field.insert_at(custom_field_params(@custom_field)[:ordering])
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: serialize_custom_fields(@custom_field.reload, params: fastjson_params), status: :ok
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def get_ui_schema_multiloc(fields)
    custom_field_service.fields_to_ui_schema_multiloc(AppConfiguration.instance, fields)
  end

  def user_ui_and_json_multiloc_schemas(fields)
    json_forms_service.user_ui_and_json_multiloc_schemas(fields)
  end

  def custom_field_service
    @custom_field_service ||= CustomFieldService.new
  end

  def json_forms_service
    @json_forms_service ||= JsonFormsService.new
  end

  def set_resource_type
    @resource_type = 'User'
  end

  def set_custom_field
    @custom_field = CustomField.find(params[:id])
    authorize @custom_field, policy_class: UserCustomFieldPolicy
  end

  def custom_field_params(resource)
    params
      .require(:custom_field)
      .permit(
        UserCustomFieldPolicy.new(current_user, resource)
                             .send("permitted_attributes_for_#{params[:action]}")
      )
  end

  def serialize_custom_fields(...)
    ::WebApi::V1::CustomFieldSerializer.new(...).serialized_json
  end
end
