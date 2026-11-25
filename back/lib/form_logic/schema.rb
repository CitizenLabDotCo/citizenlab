# frozen_string_literal: true

module FormLogic
  # JSON schema of the stored v2 format in custom_fields.logic, checked with the json-schema gem.
  #   page:     { "v": 2, "jumps": [{ "when": Cond, "goto": "<page id>" | "end" }], "next_page_id": "<page id>" | "end" | null }
  #   question: { "v": 2, "display": Cond?, "required_if": Cond? }
  #   Cond = { "all": [Cond] } | { "any": [Cond] } | { "not": Cond }
  #        | { "source": { "field": "<field id>" }, "op": "<operator>", "value": <option ids | number> }
  # Stored conditions reference field ids and option ids so copies can remap them; the
  # Compiler turns them into keys.
  module Schema
    module_function

    def page
      raise NotImplementedError
    end

    def question
      raise NotImplementedError
    end
  end
end
