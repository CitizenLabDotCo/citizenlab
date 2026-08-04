# frozen_string_literal: true

module Export
  # The fields included in an input/response export, resolved for a phase and
  # shared by the xlsx and pdf exports (and the pdf's field-review endpoint):
  #   - form_fields: the form questions, plus any user/registration fields that
  #     are embedded in the form (answered on, and read from, the input);
  #   - user_fields: registration fields collected out-of-form (answered on, and
  #     read from, the author) — empty when the form already embeds them.
  # `pmethod.custom_form` resolves the form from the right context per method
  # (the phase for surveys/proposals, the project for ideation).
  class InputFields
    def initialize(phase)
      @pmethod = phase.pmethod
    end

    def all
      form_fields + user_fields
    end

    def form_fields
      @form_fields ||= IdeaCustomFieldsService.new(@pmethod.custom_form).exportable_fields
    end

    def user_fields
      return [] if @pmethod.user_fields_in_form_enabled?

      @user_fields ||= CustomField.registration.includes(:options).order(:ordering).to_a
    end
  end
end
