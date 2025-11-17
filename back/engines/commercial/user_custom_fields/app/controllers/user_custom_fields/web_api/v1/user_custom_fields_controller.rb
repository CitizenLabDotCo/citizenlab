# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class UserCustomFieldsController < ::ApplicationController
        include LockedUserCustomFieldsConcern

        before_action :set_custom_field, only: %i[show update reorder destroy]
        skip_before_action :authenticate_user, only: %i[index show]
        skip_after_action :verify_policy_scoped

        def index
          @custom_fields = policy_scope(CustomField, policy_scope_class: UserCustomFieldPolicy::Scope)
            .registration.order(:ordering)
          @custom_fields = @custom_fields.where(input_type: params[:input_types]) if params[:input_types]

          render json: serialize_custom_fields(@custom_fields, params: jsonapi_serializer_params_with_locked_fields, include: %i[projects])
        end

        def show
          render json: serialize_custom_fields(@custom_field, params: jsonapi_serializer_params_with_locked_fields, include: %i[projects])
        end

        def create
          @custom_field = CustomField.new custom_field_params(CustomField)
          @custom_field.resource_type = 'User'
          authorize @custom_field, policy_class: UserCustomFieldPolicy

          SideFxCustomFieldService.new.before_create(@custom_field, current_user)
          if @custom_field.save
            SideFxCustomFieldService.new.after_create(@custom_field, current_user)
            render json: serialize_custom_fields(@custom_field, params: jsonapi_serializer_params_with_locked_fields), status: :created
          else
            render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @custom_field.assign_attributes custom_field_params(@custom_field)
          authorize @custom_field, policy_class: UserCustomFieldPolicy

          if @custom_field.save
            SideFxCustomFieldService.new.after_update(@custom_field, current_user)
            render json: serialize_custom_fields(@custom_field.reload, params: jsonapi_serializer_params_with_locked_fields), status: :ok
          else
            render json: { errors: @custom_field.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          if @custom_field.insert_at(custom_field_params(@custom_field)[:ordering])
            SideFxCustomFieldService.new.after_update(@custom_field, current_user)
            render json: serialize_custom_fields(@custom_field.reload, params: jsonapi_serializer_params_with_locked_fields), status: :ok
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

        def set_custom_field
          @custom_field = CustomField.find(params[:id])
          authorize @custom_field, policy_class: UserCustomFieldPolicy
        end

        def custom_field_params(resource)
          permitted_attributes = UserCustomFieldPolicy
            .new(pundit_user, resource)
            .send(:"permitted_attributes_for_#{params[:action]}")

          params.require(:custom_field).permit(permitted_attributes)
        end

        def serialize_custom_fields(...)
          UserCustomFields::WebApi::V1::UserCustomFieldSerializer.new(...).serializable_hash.to_json
        end
      end
    end
  end
end
