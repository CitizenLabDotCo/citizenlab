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

    def phase_insights_class
      Insights::NativeSurveyPhaseInsightsService
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
      form = CustomForm.create(participation_context: phase)

      default_fields(form).reverse_each do |field|
        field.save!
        field.move_to_top
      end

      phase.reload

      form
    end

    def custom_form
      phase.custom_form || CustomForm.new(participation_context: phase)
    end

    def default_fields(custom_form)
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

    delegate :user_data_collection, to: :posting_permission

    def user_fields_in_form_enabled?
      return false if posting_permission.nil?

      posting_permission.user_fields_in_form_enabled?
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

    def posting_permission
      # phase should always be defined,
      # but for some reason it's not in some unit tests.
      return nil if phase.nil?

      @posting_permission ||= Permission.find_by(
        permission_scope_id: phase.id,
        action: 'posting_idea'
      )
    end
  end
end
