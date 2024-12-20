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

    before_action :set_custom_field, only: %i[show as_geojson]
    before_action :set_custom_form, only: %i[index update_all]
    skip_after_action :verify_policy_scoped
    rescue_from UpdatingFormWithInputError, with: :render_updating_form_with_input_error

    def index
      authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy
      service = IdeaCustomFieldsService.new(@custom_form)

      fields = params[:copy] == 'true' ? service.duplicate_all_fields : service.all_fields
      fields = fields.filter(&:support_free_text_value?) if params[:support_free_text_value].present?

      render json: ::WebApi::V1::CustomFieldSerializer.new(
        fields,
        params: serializer_params(@custom_form),
        include: include_in_index_response
      ).serializable_hash
    end

    def show
      render json: ::WebApi::V1::CustomFieldSerializer.new(
        @custom_field,
        params: jsonapi_serializer_params,
        include: %i[options options.image]
      ).serializable_hash
    end

    def as_geojson
      raise_error_if_not_geographic_field

      @phase = Phase.find(params[:phase_id])
      geojson = I18n.with_locale(current_user.locale) do
        geojson_generator.generate_geojson
      end

      send_data geojson, type: 'application/json', filename: geojson_generator.filename
    end

    def update_all
      authorize CustomField.new(resource: @custom_form), :update_all?, policy_class: IdeaCustomFieldPolicy
      raise_error_if_stale_form_data

      page_temp_ids_to_ids_mapping = {}
      option_temp_ids_to_ids_mapping = {}
      errors = {}
      update_fields! page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors
      @custom_form.reload if @custom_form.persisted?
      update_logic! page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping, errors
      update_form!
      render json: ::WebApi::V1::CustomFieldSerializer.new(
        IdeaCustomFieldsService.new(@custom_form).all_fields,
        params: serializer_params(@custom_form),
        include: include_in_index_response
      ).serializable_hash
    rescue UpdateAllFailedError => e
      render json: { errors: e.errors }, status: :unprocessable_entity
    end

    private

    # Overriden from CustomMaps::Patches::IdeaCustomFields::WebApi::V1::Admin::IdeaCustomFieldsController
    def include_in_index_response
      %i[options options.image]
    end

    def raise_error_if_not_geographic_field
      return if @custom_field.geographic_input?

      raise "Custom field with input_type: '#{@custom_field.input_type}' is not a geographic type"
    end

    # To try and avoid forms being overwritten with stale data, we check if the form has been updated since the form editor last loaded it
    def raise_error_if_stale_form_data
      return unless update_all_params[:form_last_updated_at].present? &&
                    @custom_form.persisted? &&
                    @custom_form.updated_at.to_i > update_all_params[:form_last_updated_at].to_i

      raise UpdateAllFailedError, { form: [{ error: 'stale_data' }] }
    end

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
            next unless update_field!(field, field_params, errors, index)
          else
            field = create_field! field_params, errors, page_temp_ids_to_ids_mapping, index
            next unless field
          end
          if options_params
            option_temp_ids_to_ids_mapping_in_field_logic = update_options! field, options_params, errors, index
            option_temp_ids_to_ids_mapping.merge! option_temp_ids_to_ids_mapping_in_field_logic
          end
          relate_map_config_to_field(field, field_params, errors, index)
          field.set_list_position(index)
          count_fields(field)
        end
        raise UpdateAllFailedError, errors if errors.present?
      end
    end

    def create_field!(field_params, errors, page_temp_ids_to_ids_mapping, index)
      participation_method = @custom_form.participation_context.pmethod
      if field_params['code'].nil? && participation_method.allowed_extra_field_input_types.exclude?(field_params['input_type'])
        errors[index.to_s] = { input_type: [{ error: 'inclusion', value: field_params['input_type'] }] }
        return false
      end

      create_params = field_params.except('temp_id').to_h
      if create_params.key?('code') && !create_params['code'].nil?
        default_field = participation_method.default_fields(@custom_form).find do |field|
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
        return true unless field.changed?

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

    # Overridden from CustomMaps::Patches::IdeaCustomFields::WebApi::V1::Admin::IdeaCustomFieldsController
    def relate_map_config_to_field(_field, _field_params, _errors, _index); end

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
          option_params[:ordering] = option_index # Do this instead of ordering gem .move_to_bottom method for performance reasons
          if option_params[:id] && options_by_id[option_params[:id]]
            option = options_by_id[option_params[:id]]
            next unless update_option! option, option_params, errors, field_index, option_index
          else
            option = create_option! option_params, field, errors, option_temp_ids_to_ids_mapping, field_index, option_index
            next unless option
          end
          update_option_image!(option, option_params[:image_id])
        end
      end
    end

    def create_option!(option_params, field, errors, option_temp_ids_to_ids_mapping, field_index, option_index)
      create_params = option_params.except('temp_id', 'image_id')
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

    def update_option_image!(option, image_id)
      return unless image_id

      if image_id == ''
        option.image.destroy!
      else
        begin
          image = CustomFieldOptionImage.find image_id
          if image.custom_field_option.present? && image.custom_field_option != option
            # This request is coming from a form copy request, so create a copy of the image
            image = image.dup
            image.save!
          end
          option.update!(image: image)
        rescue ActiveRecord::RecordNotFound
          # NOTE: catching this exception to stop the transaction failing if the image not found by
          # This will happen if an image select field is saved in a tab when it has been removed in another.
        end
      end
    end

    def update_option!(option, option_params, errors, field_index, option_index)
      update_params = option_params.except('image_id')
      option.assign_attributes update_params
      return true unless option.changed?

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

    # Update the timestamp of the form and log the activity
    def update_form!
      return unless @custom_form.persisted?

      @custom_form.touch
      update_payload = {
        save_type: update_all_params[:form_save_type],
        pages: @page_count,
        sections: @section_count,
        fields: @field_count,
        params_size: params.to_s.size,
        form_opened_at: update_all_params[:form_opened_at],
        form_updated_at: @custom_form.updated_at.to_i
      }
      SideFxCustomFormService.new.after_update @custom_form, current_user, update_payload
    end

    def count_fields(field)
      @page_count ||= 0
      @section_count ||= 0
      @field_count ||= 0
      case field.input_type
      when 'section'
        @section_count += 1
      when 'page'
        @page_count += 1
      else
        @field_count += 1
      end
    end

    def add_options_errors(options_errors, errors, field_index, option_index)
      errors[field_index.to_s] ||= {}
      errors[field_index.to_s][:options] ||= {}
      errors[field_index.to_s][:options][option_index.to_s] = options_errors
    end

    def update_all_params
      params.permit(:form_last_updated_at, :form_opened_at, :form_save_type, custom_fields: [
        :id,
        :temp_id,
        :code,
        :key,
        :input_type,
        :required,
        :enabled,
        :maximum,
        :select_count_enabled,
        :maximum_select_count,
        :minimum_select_count,
        :random_option_ordering,
        :dropdown_layout,
        :page_layout,
        :map_config_id,
        { title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_1_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_2_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_3_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_4_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_5_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_6_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_7_multiloc: CL2_SUPPORTED_LOCALES,
          options: [
            :id,
            :key,
            :temp_id,
            :image_id,
            :other,
            {
              title_multiloc: CL2_SUPPORTED_LOCALES
            }
          ],
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

    def render_updating_form_with_input_error
      render json: { error: :updating_form_with_input }, status: :unauthorized
    end

    def serializer_params(custom_form)
      participation_method = custom_form.participation_context.pmethod
      jsonapi_serializer_params({ constraints: participation_method.constraints, supports_answer_visible_to: participation_method.supports_answer_visible_to? })
    end

    def geojson_generator
      @geojson_generator ||= Export::Geojson::GeojsonGenerator.new(@phase, @custom_field)
    end
  end
end

IdeaCustomFields::WebApi::V1::Admin::IdeaCustomFieldsController.prepend(CustomMaps::Patches::IdeaCustomFields::WebApi::V1::Admin::IdeaCustomFieldsController)
