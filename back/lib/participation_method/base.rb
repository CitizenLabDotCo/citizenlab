# frozen_string_literal: true

module ParticipationMethod
  class Base
    def self.all_methods
      [DocumentAnnotation, Ideation, Information, NativeSurvey, CommunityMonitorSurvey, Poll, Proposals, Survey, Volunteering, Voting]
    end

    def initialize(phase)
      @phase = phase
    end

    def additional_export_columns
      []
    end

    def allowed_extra_field_input_types
      []
    end

    def allowed_ideas_orders
      []
    end

    def assign_defaults(input)
      # Default is to do nothing.
    end

    def assign_defaults_for_phase
      # Default is to do nothing.
    end

    def author_in_form?(_user)
      false
    end

    def budget_in_form?(_user)
      false
    end

    def constraints
      {}
    end

    def create_default_form!
      # Default is to do nothing.
    end

    def custom_form
      context = transitive? ? phase.project : phase
      context.custom_form || CustomForm.new(participation_context: context)
    end

    def form_logic_enabled?
      false
    end

    def default_fields(_custom_form)
      []
    end

    def everyone_tracking_enabled?
      false
    end

    def generate_slug(input)
      # Input is not created in this participation method,
      # so the default is to return nothing.
    end

    # Remove after unified status implementation
    def idea_status_method
      self.class.method_str
    end

    # Should an admin be able to set permissions for disabled actions?
    def return_disabled_actions?
      false
    end

    def supports_answer_visible_to?
      false
    end

    def supports_assignment?
      false
    end

    def supports_automated_statuses?
      false
    end

    def supports_built_in_fields?
      false
    end

    def supports_commenting?
      false
    end

    def supports_edits_after_publication?
      true
    end

    def supports_exports?
      false
    end

    def supports_private_attributes_in_export?
      false
    end

    def supports_input_term?
      false
    end

    def supports_inputs_without_author?
      true
    end

    def allow_posting_again_after
      0.seconds
    end

    def supports_permitted_by_everyone?
      false
    end

    def supports_public_visibility?
      false
    end

    def supports_reacting?
      false
    end

    def supports_serializing?(_attribute)
      false
    end

    def supports_serializing_input?(_attribute)
      false
    end

    def supports_status?
      false
    end

    def supports_submission?
      false
    end

    def supports_survey_form?
      false
    end

    def supports_toxicity_detection?
      true
    end

    def transitive?
      false
    end

    def use_reactions_as_votes?
      false
    end

    def follow_idea_on_idea_submission?
      false
    end

    def validate_phase
      # Default is to do nothing.
    end

    def automatically_assign_idea?
      false
    end

    def supports_event_attendance?
      true
    end

    def supports_custom_field_categories?
      false
    end

    def user_fields_in_form?
      false
    end

    def supports_multiple_phase_reports?
      false
    end

    private

    attr_reader :phase

    def proposed_budget_in_form?
      false
    end
  end
end
