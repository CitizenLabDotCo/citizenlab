class WebApi::V1::IdeaCustomFieldsController < ApplicationController
  before_action :set_custom_field, only: [:show, :update]
  before_action :set_resource, only: [:index, :upsert_by_code]
  skip_after_action :verify_policy_scoped

  def index
    @db_custom_fields = IdeaCustomFieldPolicy::Scope.new(current_user, CustomField.all).resolve
      .where(resource: @resource)
      .order(:ordering)

    @custom_fields = IdeaCustomFieldService.new.merge_built_in_fields(@db_custom_fields)
  
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_fields, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
  end

  def upsert_by_code
    @custom_field = IdeaCustomFieldService.new.find_or_build_field(@resource, params[:code])
    @custom_field.assign_attributes custom_field_params
    if !@resource
      @resource = CustomForm.create
      Project.update(custom_form: @resource)
    end
    @custom_field.resource = @resource
    authorize @custom_field, policy_class: IdeaCustomFieldPolicy
    already_existed = @custom_field.persisted?

    if @custom_field.save
      if already_existed
        SideFxCustomFieldService.new.after_update(@custom_field, current_user)
      else
        SideFxCustomFieldService.new.after_create(@custom_field, current_user)
      end
      render json: WebApi::V1::CustomFieldSerializer.new(
        @custom_field.reload, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
    end

  end

  private

  def custom_field_params
    params
      .require(:custom_field)
      .permit(
        IdeaCustomFieldPolicy.new(current_user, @custom_field).permitted_attributes
      )
  end

  def set_resource
    @project = Project.find(params[:project_id])
    @resource = @project.custom_form
  end

  def set_custom_field
    @custom_field = CustomField.find(params[:id])
    authorize @custom_field, policy_class: IdeaCustomFieldPolicy
  end

end
