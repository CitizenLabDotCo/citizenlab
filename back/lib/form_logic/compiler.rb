# frozen_string_literal: true

module FormLogic
  # v2 (ids) -> runtime program (keys), the shape Evaluator and interpret.ts run.
  # The only place that knows option ids vs option keys and per-type operator meaning, so the
  # FE interpreter needs no `input_type` knowledge.
  # - field ids -> field keys, option ids -> option keys
  # - pages get their question keys in order; disabled fields are left out
  # - `required` copied from the field; `display` / `required_if` copied as compiled Cond
  class Compiler
    def initialize(fields, v2_logic_by_field_id)
      @fields = fields
      @logic = v2_logic_by_field_id
    end

    def call
      raise NotImplementedError
    end
  end
end
