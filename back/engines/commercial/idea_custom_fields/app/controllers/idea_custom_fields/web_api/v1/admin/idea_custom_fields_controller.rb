# frozen_string_literal: true

module IdeaCustomFields
  class WebApi::V1::Admin::IdeaCustomFieldsController < ApplicationController
    before_action :verify_feature_flag
    before_action :set_custom_field, only: %i[show update]
    before_action :set_custom_form, only: %i[index]
    skip_after_action :verify_policy_scoped

    def index
      authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy
      fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
      render json: ::WebApi::V1::CustomFieldSerializer.new(fields, params: fastjson_params).serialized_json
    end

    def show
      render json: ::WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
    end

    # `update` by ID is not possible for default custom fields that have not been persisted yet,
    # because default fields have a randomly generated ID. `upsert_by_code` should be used for
    # default fields.
    def update
      update_field do |custom_form|
        IdeaCustomFieldsService.new(custom_form).find_field_by_id(params[:id])
      end
    end

    # `upsert_by_code` cannot be used for extra fields, because they do not have a code.
    # `update` should be used for extra fields.
    def upsert_by_code
      update_field do |custom_form|
        IdeaCustomFieldsService.new(custom_form).find_or_build_field(params[:code])
      end
    end

    private

    def update_field(&_block)
      # Wrapping this in a transaction, to avoid the race condition where
      # simultaneous requests, when custom_form does not exist yet, make
      # multiple custom_forms and the last form gets associated to the project
      custom_field = ActiveRecord::Base.transaction do
        # Row-level locking of the project record
        # See https://www.2ndquadrant.com/en/blog/postgresql-anti-patterns-read-modify-write-cycles/
        project = Project.lock.find(params[:project_id])
        custom_form = CustomForm.find_or_initialize_by(project: project)
        custom_form.save! unless custom_form.persisted?

        (yield custom_form).tap do |field|
          assign_attributes_to(field)
        end
      end

      authorize custom_field, policy_class: IdeaCustomFieldPolicy
      already_existed = custom_field.persisted?

      if custom_field.save
        if already_existed
          SideFxCustomFieldService.new.after_update(custom_field, current_user)
        else
          SideFxCustomFieldService.new.after_create(custom_field, current_user)
        end
        render json: ::WebApi::V1::CustomFieldSerializer.new(
          custom_field.reload,
          params: fastjson_params
        ).serialized_json, status: :ok
      else
        render json: { errors: custom_field.errors.details }, status: :unprocessable_entity
      end
    end

    def assign_attributes_to(custom_field)
      field_params = params
        .require(:custom_field)
        .permit(IdeaCustomFieldPolicy.new(current_user, custom_field).permitted_attributes)
      custom_field.assign_attributes field_params
    end

    def set_custom_form
      @project = Project.find(params[:project_id])
      @custom_form = CustomForm.find_or_initialize_by(project: @project)
    end

    def set_custom_field
      @custom_field = CustomField.find(params[:id])
      authorize @custom_field, policy_class: IdeaCustomFieldPolicy
    end

    def verify_feature_flag
      return if AppConfiguration.instance.feature_activated? 'idea_custom_fields'

      render json: { errors: { base: [{ error: '"idea_custom_fields" feature is not activated' }] } }, status: :unauthorized
    end
  end
end
