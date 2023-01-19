# frozen_string_literal: true

module WebApi
  module V1
    module Admin
      class IdeaCustomFieldsController < ApplicationController
        class UpdateAllFailedError < StandardError
          def initialize(errors)
            super()
            @errors = errors
          end

          attr_reader :errors
        end

        class UpdatingFormWithInputError < StandardError; end

        CONSTANTIZER = {
          'Project' => {
            container_class: Project,
            container_id: :project_id
          },
          'Phase' => {
            container_class: Phase,
            container_id: :phase_id
          }
        }

        before_action :set_custom_field, only: %i[show update]
        before_action :set_custom_form, only: %i[index update_all]
        skip_after_action :verify_policy_scoped
        rescue_from UpdatingFormWithInputError, with: :render_updating_form_with_input_error

        def index
          authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy
          fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
          render json: ::WebApi::V1::CustomFieldSerializer.new(
            fields,
            params: fastjson_params,
            include: [:options]
          ).serialized_json
        end

        def show
          render json: ::WebApi::V1::CustomFieldSerializer.new(
            @custom_field,
            params: fastjson_params,
            include: [:options]
          ).serialized_json
        end

        # `update` by ID is not possible for default custom fields that have not been persisted yet,
        # because default fields have a randomly generated ID. `upsert_by_code` should be used for
        # default fields.
        def update
          update_field do |custom_form|
            IdeaCustomFieldsService.new(custom_form).find_field_by_id(params[:id])
          end
        end

        def update_all
          authorize CustomField.new(resource: @custom_form), :update_all?, policy_class: IdeaCustomFieldPolicy
          participation_method = Factory.instance.participation_method_for @custom_form.participation_context
          verify_no_responses participation_method

          update_fields
          @custom_form.reload if @custom_form.persisted?
          render json: ::WebApi::V1::CustomFieldSerializer.new(
            IdeaCustomFieldsService.new(@custom_form).configurable_fields,
            params: fastjson_params,
            include: [:options]
          ).serialized_json
        rescue UpdateAllFailedError => e
          render json: { errors: e.errors }, status: :unprocessable_entity
        end

        # `upsert_by_code` cannot be used for extra fields, because they do not have a code.
        # `update` should be used for extra fields.
        def upsert_by_code
          update_field do |custom_form|
            IdeaCustomFieldsService.new(custom_form).find_or_build_field(params[:code])
          end
        end

        private

        def update_fields
          errors = {}
          fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
          fields_by_id = fields.index_by(&:id)
          given_fields = update_all_params.fetch :custom_fields, []
          given_field_ids = given_fields.pluck(:id)

          ActiveRecord::Base.transaction do
            deleted_fields = fields.reject { |field| given_field_ids.include? field.id }
            deleted_fields.each do |field|
              SideFxCustomFieldService.new.before_destroy(field, current_user)
              field.destroy!
              SideFxCustomFieldService.new.after_destroy(field, current_user)
            end
            page_temp_ids_to_ids_mapping = {}
            option_temp_ids_to_ids_mapping = {}
            given_fields.each_with_index do |field_params, index|
              options_params = field_params.delete :options
              if field_params[:id]
                field = fields_by_id[field_params[:id]]
                field.assign_attributes field_params
                SideFxCustomFieldService.new.before_update(field, current_user)
                unless field.save
                  errors[index.to_s] = field.errors.details
                  next
                end
                SideFxCustomFieldService.new.after_update(field, current_user)
              else
                update_params = field_params.except('temp_id')
                field = CustomField.new update_params.merge(resource: @custom_form)
                SideFxCustomFieldService.new.before_create(field, current_user)
                if field.save
                  page_temp_ids_to_ids_mapping[field_params[:temp_id]] = field.id if field_params[:temp_id]
                else
                  errors[index.to_s] = field.errors.details
                  next
                end
                SideFxCustomFieldService.new.after_create(field, current_user)
              end
              if options_params
                option_temp_ids_to_ids_mapping_in_field_logic = update_options field, options_params, errors, index
                option_temp_ids_to_ids_mapping.merge! option_temp_ids_to_ids_mapping_in_field_logic
              end
              field.move_to_bottom
            end
            raise UpdateAllFailedError, errors if errors.present?

            fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
            form_logic = FormLogicService.new(fields)
            form_logic.replace_temp_ids!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
            unless form_logic.valid?
              fields.each_with_index do |field, index|
                errors[index.to_s] = field.errors.details
              end
            end
            raise UpdateAllFailedError, errors if errors.present?
          end
        end

        def update_field(&_block)
          # Wrapping this in a transaction, to avoid the race condition where
          # simultaneous requests, when custom_form does not exist yet, make
          # multiple custom_forms and the last form gets associated to the project
          custom_field = ActiveRecord::Base.transaction do
            # Row-level locking of the project record
            # See https://www.2ndquadrant.com/en/blog/postgresql-anti-patterns-read-modify-write-cycles/
            project = Project.lock.find(params[:project_id])
            custom_form = CustomForm.find_or_initialize_by(participation_context: project)
            custom_form.save! unless custom_form.persisted?

            (yield custom_form).tap do |field|
              assign_attributes_to(field)
            end
          end

          authorize custom_field, policy_class: IdeaCustomFieldPolicy
          already_existed = custom_field.persisted?

          SideFxCustomFieldService.new.before_update custom_field, current_user
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

        def update_options(field, options_params, errors, field_index)
          {}.tap do |option_temp_ids_to_ids_mapping|
            options = field.options
            options_by_id = options.index_by(&:id)
            given_ids = options_params.pluck :id

            deleted_options = options.reject { |option| given_ids.include? option.id }
            deleted_options.each do |option|
              SideFxCustomFieldOptionService.new.before_destroy option, current_user
              option.destroy!
              SideFxCustomFieldOptionService.new.after_destroy option, current_user
            end
            options_params.each_with_index do |option_params, option_index|
              if option_params[:id]
                option = options_by_id[option_params[:id]]
                option.assign_attributes option_params
                SideFxCustomFieldOptionService.new.before_update option, current_user
                unless option.save
                  add_options_errors option.errors.details, errors, field_index, option_index
                  next
                end
                SideFxCustomFieldOptionService.new.after_update option, current_user
              else
                create_params = option_params.except('temp_id')
                option = CustomFieldOption.new create_params.merge(custom_field: field)
                SideFxCustomFieldOptionService.new.before_create option, current_user
                if option.save
                  option_temp_ids_to_ids_mapping[option_params[:temp_id]] = option.id if option_params[:temp_id]
                else
                  add_options_errors option.errors.details, errors, field_index, option_index
                  next
                end
                SideFxCustomFieldOptionService.new.after_create option, current_user
              end
              option.move_to_bottom
            end
          end
        end

        def add_options_errors(options_errors, errors, field_index, option_index)
          errors[field_index.to_s] ||= {}
          errors[field_index.to_s][:options] ||= {}
          errors[field_index.to_s][:options][option_index.to_s] = options_errors
        end

        def assign_attributes_to(custom_field)
          field_params = params
            .require(:custom_field)
            .permit(IdeaCustomFieldPolicy.new(current_user, custom_field).permitted_attributes)
          custom_field.assign_attributes field_params
        end

        def update_all_params
          params.permit(custom_fields: [
            :id,
            :temp_id,
            :input_type,
            :required,
            :enabled,
            :maximum,
            { title_multiloc: CL2_SUPPORTED_LOCALES,
              description_multiloc: CL2_SUPPORTED_LOCALES,
              minimum_label_multiloc: CL2_SUPPORTED_LOCALES,
              maximum_label_multiloc: CL2_SUPPORTED_LOCALES,
              options: [:id, :temp_id, { title_multiloc: CL2_SUPPORTED_LOCALES }],
              logic: {} }
          ])
        end

        def set_custom_form
          container_id = params[secure_constantize(:container_id)]
          @container = secure_constantize(:container_class).find container_id
          @custom_form = CustomForm.find_or_initialize_by participation_context: @container
        end

        def set_custom_field
          @custom_field = CustomField.find params[:id]
          authorize @custom_field, policy_class: IdeaCustomFieldPolicy
        end

        def secure_constantize(key)
          CONSTANTIZER.fetch(params[:container_type])[key]
        end

        def verify_no_responses(participation_method)
          return if participation_method.edit_custom_form_allowed?

          raise UpdatingFormWithInputError
        end

        def render_updating_form_with_input_error
          render json: { error: :updating_form_with_input }, status: :unauthorized
        end
      end
    end
  end
end
