# frozen_string_literal: true

module FormLogic
  # Server-side enforcement on idea create/update and bulk import:
  # drops answers to questions that were not visible (and their _other / _follow_up companions)
  # and, when publishing, checks required on the visible required keys
  # (InputTypeStrategy#answered?). In shadow mode it only reports differences.
  class SubmissionGuard
    def initialize(custom_form, mode: :shadow)
      @custom_form = custom_form
      @mode = mode
    end

    # Returns [filtered_values, errors].
    def call(values, publishing:)
      raise NotImplementedError
    end
  end
end
