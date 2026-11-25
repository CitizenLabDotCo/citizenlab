# frozen_string_literal: true

module FormLogic
  # Human-readable and structured views of v2 logic, for consumers that show logic rather than
  # run it: printed/PDF routing instructions, the results logic overlay, the builder overview.
  class Describer
    def initialize(fields, v2_logic_by_field_id, locale:)
      @fields = fields
      @logic = v2_logic_by_field_id
      @locale = locale
    end

    # "If you answered A or B to question 3, go to page 5."
    def instructions_for(field)
      raise NotImplementedError
    end

    # Pages a page can lead to, without answers (for overlays and broken-logic warnings).
    def static_targets(page)
      raise NotImplementedError
    end
  end
end
