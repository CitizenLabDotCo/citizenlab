# frozen_string_literal: true

module UserCustomFields
  class WebApi::V1::UserCustomFieldsController < ApplicationController
    before_action :set_custom_field, only: %i[show update reorder destroy]
    before_action :set_resource_type, only: %i[index schema create json_forms_schema]
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped

    def index
      @custom_fields = UserCustomFieldPolicy::Scope.new(current_user, CustomField.all).resolve
        .where(resource_type: @resource_type)
        .order(:ordering)
      @custom_fields = @custom_fields.where(input_type: params[:input_types]) if params[:input_types]

      render json: serialize_custom_fields(@custom_fields, params: jsonapi_serializer_params, include: %i[projects])
    end

    def schema
      authorize :custom_field, policy_class: UserCustomFieldPolicy
      fields = CustomField.with_resource_type(@resource_type)
      json_schema_multiloc = custom_field_service.fields_to_json_schema_multiloc(AppConfiguration.instance, fields)
      ui_schema_multiloc = get_ui_schema_multiloc(fields)

      render json: raw_json({ json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc })
    end

    def json_forms_schema
      authorize :custom_field, policy_class: UserCustomFieldPolicy
      fields = CustomField.with_resource_type(@resource_type)

      render json: raw_json(user_ui_and_json_multiloc_schemas(fields))
    end

    def show
      render json: serialize_custom_fields(@custom_field, params: jsonapi_serializer_params, include: %i[projects])
    end

    def create
      @custom_field = CustomField.new custom_field_params(CustomField)
      @custom_field.resource_type = @resource_type
      authorize @custom_field, policy_class: UserCustomFieldPolicy

      SideFxCustomFieldService.new.before_create(@custom_field, current_user)

      if @custom_field.save
        SideFxCustomFieldService.new.after_create(@custom_field, current_user)
        render json: serialize_custom_fields(@custom_field, params: jsonapi_serializer_params), status: :created
      else
        render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      @custom_field.assign_attributes custom_field_params(@custom_field)
      authorize @custom_field, policy_class: UserCustomFieldPolicy
      SideFxCustomFieldService.new.before_update @custom_field, current_user
      if @custom_field.save
        SideFxCustomFieldService.new.after_update(@custom_field, current_user)
        render json: serialize_custom_fields(@custom_field.reload, params: jsonapi_serializer_params), status: :ok
      else
        render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
      end
    end

    def reorder
      fix_reordering
      if @custom_field.insert_at(custom_field_params(@custom_field)[:ordering])
        SideFxCustomFieldService.new.after_update(@custom_field, current_user)
        render json: serialize_custom_fields(@custom_field.reload, params: jsonapi_serializer_params), status: :ok
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
        head :internal_server_error
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
      UserCustomFields::WebApi::V1::UserCustomFieldSerializer.new(...).serializable_hash.to_json
    end

    # Fix the ordering so it is sequential - sometimes some fields can get set to the same order position
    def fix_reordering
      fields = CustomField.with_resource_type('User').order(:ordering)
      if fields.pluck(:ordering) != (0..fields.size - 1).to_a
        fields.each_with_index do |field, index|
          field.set_list_position(index)
        end
      end
    end
  end
end

UserCustomFields::WebApi::V1::UserCustomFieldsController.prepend(Verification::Patches::WebApi::V1::UserCustomFieldsController)
