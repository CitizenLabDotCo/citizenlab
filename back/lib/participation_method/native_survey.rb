# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    delegate :allowed_extra_field_input_types, :default_fields, :logic_enabled?, :constraints, :follow_project_on_idea_submission?, to: :native_survey_method

    def self.method_str
      'native_survey'
    end

    def assign_defaults(input)
      input.publication_status ||= 'published'
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')
    end

    def assign_defaults_for_phase
      phase.native_survey_method ||= 'standard'
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

    def supports_multiple_posts?
      false
    end

    def supports_pages_in_form?
      true
    end

    def supports_permitted_by_everyone?
      true
    end

    def supports_serializing?(attribute)
      %i[native_survey_method native_survey_title_multiloc native_survey_button_multiloc].include?(attribute)
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

    def native_survey_method
      Factory.instance.native_survey_method_for(phase)
    end
  end
end
