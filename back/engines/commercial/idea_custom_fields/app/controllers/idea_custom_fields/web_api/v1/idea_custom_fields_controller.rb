# frozen_string_literal: true

module IdeaCustomFields
  class WebApi::V1::IdeaCustomFieldsController < ApplicationController
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

    skip_before_action :authenticate_user, only: %i[index]
    before_action :set_custom_field, only: %i[show as_geojson]
    before_action :set_custom_form, only: %i[index update_all]
    skip_after_action :verify_policy_scoped

    def index
      authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy

      # The elsif and else parts are a bit messy because of the challenges of combining arrays from
      # the IdeaCustomFieldsService and the scope from the policy, while falling back to non-
      # persisted default fields. In my opinion, we should always persist the default fields, and
      # replace the IdeaCustomFieldsService by a generalized CustomFieldPolicy.
      service = IdeaCustomFieldsService.new(@custom_form)
      fields = if params[:copy] == 'true'
        service.duplicate_all_fields
      elsif params[:public_fields] == 'true'
        service.enabled_fields.select { |field| IdeaCustomFieldPolicy.new(pundit_user, field).show? }
      elsif @custom_form.custom_field_ids.present?
        authorized_ids = IdeaCustomFieldPolicy::Scope.new(pundit_user, @custom_form.custom_fields, @custom_form).resolve.ids
        service.all_fields.select { |field| authorized_ids.include? field.id }
      else
        service.all_fields.select { |field| IdeaCustomFieldPolicy.new(pundit_user, field).show? }
      end
      fields = fields.filter(&:supports_free_text_value?) if params[:support_free_text_value].present?
      fields = fields.filter { |field| params[:input_types].include?(field.input_type) } if params[:input_types].present?

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
        include: include_in_index_response
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

      update_all_service = UpdateAllService.new(
        @custom_form,
        current_user,
        custom_fields: update_all_params[:custom_fields],
        fields_last_updated_at: update_all_params[:fields_last_updated_at],
        form_save_type: update_all_params[:form_save_type],
        form_opened_at: update_all_params[:form_opened_at],
        params_size: update_all_params.to_s.size
      )
      result = update_all_service.update_all
      if result.success?
        render json: ::WebApi::V1::CustomFieldSerializer.new(
          result.fields,
          params: serializer_params(@custom_form),
          include: include_in_index_response
        ).serializable_hash
      else
        render json: { errors: result.errors }, status: :unprocessable_entity
      end
    end

    private

    # Extended by CustomMaps::Patches::IdeaCustomFields::WebApi::V1::Admin::IdeaCustomFieldsController
    def include_in_index_response
      %i[options options.image matrix_statements resource]
    end

    def raise_error_if_not_geographic_field
      return if @custom_field.geographic_input?

      raise "Custom field with input_type: '#{@custom_field.input_type}' is not a geographic type"
    end

    def update_all_params
      params.permit(:fields_last_updated_at, :form_opened_at, :form_save_type, custom_fields: [
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
        :page_button_link,
        :map_config_id,
        :ask_follow_up,
        :question_category,
        :include_in_printed_form,
        :min_characters,
        :max_characters,
        { title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES,
          page_button_label_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_1_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_2_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_3_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_4_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_5_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_6_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_7_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_8_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_9_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_10_multiloc: CL2_SUPPORTED_LOCALES,
          linear_scale_label_11_multiloc: CL2_SUPPORTED_LOCALES,
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
          matrix_statements: [
            :id,
            :key,
            :temp_id,
            { title_multiloc: CL2_SUPPORTED_LOCALES }
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

    def serializer_params(custom_form)
      participation_method = custom_form.participation_context.pmethod
      jsonapi_serializer_params({ constraints: participation_method.constraints, supports_answer_visible_to: participation_method.supports_answer_visible_to? })
    end

    def geojson_generator
      @geojson_generator ||= Export::Geojson::GeojsonGenerator.new(@phase, @custom_field)
    end
  end
end

IdeaCustomFields::WebApi::V1::IdeaCustomFieldsController.prepend(CustomMaps::Patches::IdeaCustomFields::WebApi::V1::IdeaCustomFieldsController)
