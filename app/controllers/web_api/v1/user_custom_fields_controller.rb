class WebApi::V1::UserCustomFieldsController < ApplicationController
  before_action :set_custom_field, only: [:show, :update, :reorder, :destroy]
  before_action :set_resource_type, only: [:index, :schema, :create]
  skip_after_action :verify_policy_scoped

  def index
    @custom_fields = UserCustomFieldPolicy::Scope.new(current_user, CustomField.all).resolve
      .where(resource_type: @resource_type)
      .order(:ordering)

    @custom_fields = @custom_fields.where(input_type: params[:input_types]) if params[:input_types]
  
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_fields, params: fastjson_params).serialized_json
  end

  def schema
    authorize :custom_field, policy_class: UserCustomFieldPolicy
    fields = CustomField.with_resource_type(@resource_type)

    service = CustomFieldService.new
    json_schema_multiloc = service.fields_to_json_schema_multiloc(AppConfiguration.instance, fields)
    ui_schema_multiloc = service.fields_to_ui_schema_multiloc(AppConfiguration.instance, fields)

    mark_locked_fields(ui_schema_multiloc) if current_user

    render json: {json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc}
  end

  def show
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
  end


  def create
    @custom_field = CustomField.new custom_field_params(CustomField)
    @custom_field.resource_type = @resource_type
    authorize @custom_field, policy_class: UserCustomFieldPolicy

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
    @custom_field.assign_attributes custom_field_params(@custom_field)
    authorize @custom_field, policy_class: UserCustomFieldPolicy
    if @custom_field.save
      SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      render json: WebApi::V1::CustomFieldSerializer.new(
        @custom_field.reload, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @custom_field.insert_at(custom_field_params(@custom_field)[:ordering])
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
    @resource_type = "User"
  end

  def set_custom_field
    @custom_field = CustomField.find(params[:id])
    authorize @custom_field, policy_class: UserCustomFieldPolicy
  end

  def custom_field_params resource
    params
      .require(:custom_field)
      .permit(
        UserCustomFieldPolicy.new(current_user, resource)
          .send("permitted_attributes_for_#{params[:action]}")
      )
  end

  def secure_controller?
    false
  end

  def mark_locked_fields ui_schema_multiloc
    verification_service = Verification::VerificationService.new
    locked_custom_fields = verification_service.locked_custom_fields(current_user).map(&:to_s)
    ui_schema_multiloc.each do |_locale, ui_schema|
      ui_schema
        .keys
        .select{|key| locked_custom_fields.include? key}
        .each do |key|
          ui_schema[key]["ui:disabled"] = true
          ui_schema[key]["ui:options"] = (ui_schema[key]["ui_options"] || {}).merge(
            verificationLocked: true
          )
        end
    end
  end
end
