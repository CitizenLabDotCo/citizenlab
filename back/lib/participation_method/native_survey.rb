# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    ALLOWED_EXTRA_FIELD_TYPES = %w[
      page number linear_scale rating text multiline_text select multiselect
      multiselect_image file_upload shapefile_upload point line polygon
      ranking matrix_linear_scale sentiment_linear_scale
    ]

    def self.method_str
      'native_survey'
    end

    def allowed_extra_field_input_types
      ALLOWED_EXTRA_FIELD_TYPES
    end

    def assign_defaults(input)
      input.publication_status ||= 'published'
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')
    end

    # NOTE: This is only ever used by the analyses controller - otherwise the front-end always persists the form
    def create_default_form!
      form = CustomForm.new(participation_context: phase)

      default_fields(form).reverse_each do |field|
        field.save!
        field.move_to_top
      end

      form.save!
      phase.reload

      form
    end

    def custom_form
      phase.custom_form || CustomForm.new(participation_context: phase)
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        start_page_field(custom_form),
        CustomField.new(
          id: SecureRandom.uuid,
          key: CustomFieldService.new.generate_key(
            multiloc_service.i18n_to_multiloc('form_builder.default_select_field.title').values.first
          ),
          resource: custom_form,
          input_type: 'select',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.title'),
          options: [
            CustomFieldOption.new(
              id: SecureRandom.uuid,
              key: 'option1',
              title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.option1')
            ),
            CustomFieldOption.new(
              id: SecureRandom.uuid,
              key: 'option2',
              title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.option2')
            )
          ]
        ),
        end_page_field(custom_form, multiloc_service)
      ]
    end

    def form_logic_enabled?
      true
    end

    # Survey responses do not have a fixed field that can be used
    # to generate a slug, so use the id as the basis for the slug.
    def generate_slug(input)
      input.id ||= SecureRandom.uuid # Generate the ID if the input is not persisted yet.
      SlugService.new.generate_slug input, input.id
    end

    def return_disabled_actions?
      true
    end

    def supports_edits_after_publication?
      false
    end

    def supports_exports?
      true
    end

    def supports_private_attributes_in_export?
      setting = AppConfiguration.instance.settings.dig('core', 'private_attributes_in_export')
      setting.nil? ? true : setting
    end

    def allow_posting_again_after
      nil # Never allow posting again
    end

    def supported_email_campaigns
      super + %w[native_survey_not_submitted survey_submitted]
    end

    def supports_permitted_by_everyone?
      true
    end

    def supports_serializing?(attribute)
      %i[native_survey_title_multiloc native_survey_button_multiloc].include?(attribute)
    end

    def supports_submission?
      true
    end

    def supports_survey_form?
      true
    end

    def supports_toxicity_detection?
      false
    end

    # Attribute used interally by backend to determine if user fields should be shown in the form
    def user_fields_in_form?
      return false if phase.anonymity == 'full_anonymity'

      permission = Permission.find_by(
        permission_scope_id: phase.id,
        action: 'posting_idea'
      )

      case permission&.permitted_by
      when 'everyone'
        !permission.permissions_custom_fields.empty?
      when 'everyone_confirmed_email'
        phase.user_fields_in_form && !permission.permissions_custom_fields.empty?
      else
        if permission.global_custom_fields == true
          phase.user_fields_in_form
        else
          phase.user_fields_in_form && !permission.permissions_custom_fields.empty?
        end
      end
    end

    # Attribute used in frontend to render UI
    def user_fields_in_form_frontend_descriptor
      permission = Permission.find_by(
        permission_scope_id: phase.id,
        action: 'posting_idea'
      )

      if permission&.permitted_by == 'everyone'
        if phase.anonymity == 'full_anonymity'
          {
            value: nil,
            locked: true,
            explanation: 'cannot_ask_demographic_fields_with_this_combination_of_permitted_by_and_anonymity'
          }
        else
          {
            value: true,
            locked: true,
            explanation: 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
          }
        end
      elsif phase.anonymity == 'full_anonymity'
        {
          value: false,
          locked: true,
          explanation: 'with_these_settings_can_only_ask_demographic_fields_in_registration_flow'
        }
      else
        {
          value: phase.user_fields_in_form,
          locked: false,
          explanation: nil
        }
      end
    end

    private

    def start_page_field(custom_form)
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'page1',
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default'
      )
    end

    def end_page_field(custom_form, multiloc_service)
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'form_end',
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default',
        title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
        description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3'),
        include_in_printed_form: false
      )
    end
  end
end
