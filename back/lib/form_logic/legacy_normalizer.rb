# frozen_string_literal: true

module FormLogic
  # In-memory v1 -> v2 conversion, so the engine only ever sees v2. Deleted after the data rake
  # has rewritten every row.
  #
  # Per page, builds one ordered first-match `jumps` list that reproduces today's runtime:
  # - questions in reverse page order (last question with a matching rule wins);
  # - within a question: explicit option/value rules (legacy multiselect: farthest target
  #   first), then `any_other_answer` as `present`, then `no_answer` as `absent`;
  # - `next_page_id` stays the page default, unless the page also has question rules (S12),
  #   where the chosen semantics must be encoded explicitly.
  # Drops and reports `if: nil`, dangling and TEMP-ID refs; `form_end` -> `end`; "3" -> 3.
  class LegacyNormalizer
    Report = Struct.new(:dropped, keyword_init: true)

    def initialize(fields)
      @fields = fields
    end

    # Returns { field_id => v2 logic hash }.
    def call
      raise NotImplementedError
    end

    def report
      raise NotImplementedError
    end
  end
end
