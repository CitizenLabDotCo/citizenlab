# frozen_string_literal: true

module FormLogic
  # Validates v2 logic for a whole form in memory, before anything is persisted, so the form
  # builder can save fields and logic in one transaction.
  # Checks: schema; every referenced field/option/page exists; jumps only go forward;
  # display/required_if only reference earlier questions; each operator is allowed for the
  # source field's type (InputTypeStrategy#logic_operators).
  # Errors are keyed by field index, the shape update_all already maps into the builder.
  class Validator
    def initialize(fields, v2_logic_by_field_id)
      @fields = fields
      @logic = v2_logic_by_field_id
    end

    # Returns { field_index => [error hashes] }, empty when valid.
    def call
      raise NotImplementedError
    end
  end
end
