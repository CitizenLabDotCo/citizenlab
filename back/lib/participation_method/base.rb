# frozen_string_literal: true

module ParticipationMethod
  class Base
    def initialize(phase)
      @phase = phase
    end

    def transitive?
      false
    end

    def assign_defaults_for_phase
      # Default is to do nothing.
    end

    def generate_slug(input)
      # Input is not created in this participation method,
      # so the default is to return nothing.
    end

    def assign_defaults(input)
      # Default is to do nothing.
    end

    def create_default_form!
      # Default is to do nothing.
    end

    def default_fields(_custom_form)
      []
    end

    def allowed_extra_field_input_types
      []
    end

    def constraints
      {}
    end

    def form_structure_element
      nil
    end

    def validate_built_in_fields?
      # Most participation methods do not have built-in fields,
      # so return false.
      false
    end

    def author_in_form?(_user)
      false
    end

    def budget_in_form?(_user)
      false
    end

    def proposed_budget_in_form?
      false
    end

    def allowed_ideas_orders
      []
    end

    def never_show?
      false
    end

    def posting_allowed? # TODO: Rename to posting_supported?
      false
    end

    def update_if_published?
      true
    end

    def custom_form
      context = transitive? ? phase.project : phase
      context.custom_form || CustomForm.new(participation_context: context)
    end

    def sign_in_required_for_posting?
      false
    end

    def extra_fields_category_translation_key
      'custom_forms.categories.extra.title'
    end

    def supports_exports?
      false
    end

    def supports_commenting?
      false
    end

    def supports_reacting?
      false
    end

    def supports_status?
      false
    end

    def supports_assignment?
      false
    end

    def supports_toxicity_detection?
      true
    end

    def supports_idea_form?
      false
    end

    def supports_input_term?
      false
    end

    def supports_survey_form?
      false
    end

    def supports_permitted_by_everyone?
      false
    end

    def supports_answer_visible_to?
      false
    end

    # Should an admin be able to set permissions for disabled actions?
    def return_disabled_actions?
      false
    end

    def additional_export_columns
      []
    end

    private

    attr_reader :phase
  end
end
