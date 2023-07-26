# frozen_string_literal: true

module IdeaCustomFields
  class UpdateAllFailedError < StandardError
    def initialize(errors)
      super()
      @errors = errors
    end
    attr_reader :errors
  end

  class UpdatingFormWithInputError < StandardError; end

  class WebApi::V1::Admin::IdeaCustomFieldsController < ApplicationController
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

    before_action :set_custom_field, only: %i[show]
    before_action :set_custom_form, only: %i[index update_all]
    skip_after_action :verify_policy_scoped
    rescue_from UpdatingFormWithInputError, with: :render_updating_form_with_input_error

    def index
      authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy
      fields = IdeaCustomFieldsService.new(@custom_form).all_fields

      fields = fields.filter(&:support_free_text_value?) if params[:support_free_text_value].present?

      render json: ::WebApi::V1::CustomFieldSerializer.new(
        fields,
        params: serializer_params(@custom_form),
        include: [:options]
      ).serializable_hash
    end

    def show
      render json: ::WebApi::V1::CustomFieldSerializer.new(
        @custom_field,
        params: jsonapi_serializer_params,
        include: [:options]
      ).serializable_hash
    end

    def update_all
      authorize CustomField.new(resource: @custom_form), :update_all?, policy_class: IdeaCustomFieldPolicy
      @participation_method = Factory.instance.participation_method_for @custom_form.participation_context
      verify_no_responses @participation_method

      page_temp_ids_to_ids_mapping = {}
      option_temp_ids_to_ids_mapping = {}
      errors = {}
      update_fields! page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors
      @custom_form.reload if @custom_form.persisted?
      update_logic! page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors
      render json: ::WebApi::V1::CustomFieldSerializer.new(
        IdeaCustomFieldsService.new(@custom_form).all_fields,
        params: serializer_params(@custom_form),
        include: [:options]
      ).serializable_hash
    rescue UpdateAllFailedError => e
      render json: { errors: e.errors }, status: :unprocessable_entity
    end

    private

    def update_fields!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors)
      idea_custom_fields_service = IdeaCustomFieldsService.new(@custom_form)
      fields = idea_custom_fields_service.all_fields
      fields_by_id = fields.index_by(&:id)
      given_fields = update_all_params.fetch :custom_fields, []
      given_field_ids = given_fields.pluck(:id)

      idea_custom_fields_service.check_form_structure given_fields, errors
      raise UpdateAllFailedError, errors if errors.present?

      ActiveRecord::Base.transaction do
        delete_fields = fields.reject { |field| given_field_ids.include? field.id }
        delete_fields.each { |field| delete_field! field }
        given_fields.each_with_index do |field_params, index|
          options_params = field_params.delete :options
          if field_params[:id] && fields_by_id.key?(field_params[:id])
            field = fields_by_id[field_params[:id]]
            next unless update_field! field, field_params, errors, index
          else
            field = create_field! field_params, errors, page_temp_ids_to_ids_mapping, index
            next unless field
          end
          if options_params
            option_temp_ids_to_ids_mapping_in_field_logic = update_options! field, options_params, errors, index
            option_temp_ids_to_ids_mapping.merge! option_temp_ids_to_ids_mapping_in_field_logic
          end
          field.set_list_position(index)
        end
        raise UpdateAllFailedError, errors if errors.present?
      end
    end

    def create_field!(field_params, errors, page_temp_ids_to_ids_mapping, index)
      create_params = field_params.except('temp_id').to_h
      if create_params.key? 'code'
        default_field = @participation_method.default_fields(@custom_form).find do |field|
          field.code == create_params['code']
        end
        create_params['key'] = default_field.key
      end
      field = CustomField.new create_params.merge(resource: @custom_form)

      IdeaCustomFieldsService.new(@custom_form).validate_constraints_against_defaults(field)
      if field.errors.errors.empty?
        SideFxCustomFieldService.new.before_create field, current_user
        if field.save
          page_temp_ids_to_ids_mapping[field_params[:temp_id]] = field.id if field_params[:temp_id]
          SideFxCustomFieldService.new.after_create field, current_user
          field
        else
          errors[index.to_s] = field.errors.details
          false
        end
      else
        errors[index.to_s] = field.errors.details
        false
      end
    end

    def update_field!(field, field_params, errors, index)
      idea_custom_field_service = IdeaCustomFieldsService.new(@custom_form)
      idea_custom_field_service.validate_constraints_against_updates field, field_params
      field_params = idea_custom_field_service.remove_ignored_update_params field_params
      if field.errors.errors.empty?
        field.assign_attributes field_params
        SideFxCustomFieldService.new.before_update field, current_user
        if field.save
          SideFxCustomFieldService.new.after_update field, current_user
          field
        else
          errors[index.to_s] = field.errors.details
          false
        end
      else
        errors[index.to_s] = field.errors.details
        false
      end
    end

    def delete_field!(field)
      SideFxCustomFieldService.new.before_destroy field, current_user
      field.destroy!
      SideFxCustomFieldService.new.after_destroy field, current_user
      field
    end

    def update_options!(field, options_params, errors, field_index)
      {}.tap do |option_temp_ids_to_ids_mapping|
        options = field.options
        options_by_id = options.index_by(&:id)
        given_ids = options_params.pluck :id

        deleted_options = options.reject { |option| given_ids.include? option.id }
        deleted_options.each { |option| delete_option! option }
        options_params.each_with_index do |option_params, option_index|
          if option_params[:id]
            option = options_by_id[option_params[:id]]
            next unless update_option! option, option_params, errors, field_index, option_index
          else
            option = create_option! option_params, field, errors, option_temp_ids_to_ids_mapping, field_index, option_index
            next unless option
          end
          option.move_to_bottom
        end
      end
    end

    def create_option!(option_params, field, errors, option_temp_ids_to_ids_mapping, field_index, option_index)
      create_params = option_params.except('temp_id')
      option = CustomFieldOption.new create_params.merge(custom_field: field)
      SideFxCustomFieldOptionService.new.before_create option, current_user
      if option.save
        option_temp_ids_to_ids_mapping[option_params[:temp_id]] = option.id if option_params[:temp_id]
        SideFxCustomFieldOptionService.new.after_create option, current_user
        option
      else
        add_options_errors option.errors.details, errors, field_index, option_index
        false
      end
    end

    def update_option!(option, option_params, errors, field_index, option_index)
      option.assign_attributes option_params
      SideFxCustomFieldOptionService.new.before_update option, current_user
      if option.save
        SideFxCustomFieldOptionService.new.after_update option, current_user
        option
      else
        add_options_errors option.errors.details, errors, field_index, option_index
        false
      end
    end

    def delete_option!(option)
      SideFxCustomFieldOptionService.new.before_destroy option, current_user
      option.destroy!
      SideFxCustomFieldOptionService.new.after_destroy option, current_user
      option
    end

    def update_logic!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors)
      fields = IdeaCustomFieldsService.new(@custom_form).all_fields
      form_logic = FormLogicService.new fields
      form_logic.replace_temp_ids! page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping
      unless form_logic.valid?
        fields.each_with_index do |field, index|
          errors[index.to_s] = field.errors.details
        end
      end
      raise UpdateAllFailedError, errors if errors.present?
    end

    def add_options_errors(options_errors, errors, field_index, option_index)
      errors[field_index.to_s] ||= {}
      errors[field_index.to_s][:options] ||= {}
      errors[field_index.to_s][:options][option_index.to_s] = options_errors
    end

    def update_all_params
      params.permit(custom_fields: [
        :id,
        :temp_id,
        :code,
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

    def serializer_params(custom_form)
      participation_method = Factory.instance.participation_method_for custom_form.participation_context
      jsonapi_serializer_params({ constraints: participation_method.constraints, supports_answer_visible_to: participation_method.supports_answer_visible_to? })
    end
  end
end
