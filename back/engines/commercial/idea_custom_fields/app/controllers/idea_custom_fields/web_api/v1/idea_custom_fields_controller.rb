module IdeaCustomFields
  class WebApi::V1::IdeaCustomFieldsController < ApplicationController
    before_action :set_custom_field, only: %i[show update]
    before_action :set_custom_form, only: %i[index]
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped

    def index
      @custom_fields = IdeaCustomFieldPolicy::Scope.new(current_user, CustomField.all).resolve
                                               .where(resource: @custom_form)
                                               .order(:ordering)

      if IdeaCustomFieldPolicy.new(current_user, nil).can_view_custom_fields_for_project? @project
        @custom_fields = IdeaCustomFieldsService.new.all_fields(@custom_form, custom_fields_scope: @custom_fields)
      end

      render json: ::WebApi::V1::CustomFieldSerializer.new(@custom_fields, params: fastjson_params).serialized_json
    end

    def show
      render json: ::WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
    end

    def upsert_by_code
      # Wrapping this in a transaction, to avoid the race condition where
      # simultaneous requests, when custom_form does not exist yet, make
      # multiple custom_forms and the last form gets associated to the project
      ActiveRecord::Base.transaction do
        # Row-level locking of the project record
        # See https://www.2ndquadrant.com/en/blog/postgresql-anti-patterns-read-modify-write-cycles/
        @project = Project.lock.find(params[:project_id])
        @custom_form = CustomForm.find_or_initialize_by(project: @project)

        @custom_field = IdeaCustomFieldsService.new.find_or_build_field(@custom_form, params[:code])
        @custom_field.assign_attributes custom_field_params

        @custom_form.save! unless @custom_form.persisted?
      end

      authorize @custom_field, policy_class: IdeaCustomFieldPolicy
      already_existed = @custom_field.persisted?

      if @custom_field.save
        if already_existed
          SideFxCustomFieldService.new.after_update(@custom_field, current_user)
        else
          SideFxCustomFieldService.new.after_create(@custom_field, current_user)
        end
        render json: ::WebApi::V1::CustomFieldSerializer.new(
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

    def set_custom_form
      @project = Project.find(params[:project_id])
      @custom_form = CustomForm.find_or_initialize_by(project: @project)
    end

    def set_custom_field
      @custom_field = CustomField.find(params[:id])
      authorize @custom_field, policy_class: IdeaCustomFieldPolicy
    end
  end
end
