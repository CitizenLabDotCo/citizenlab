# frozen_string_literal: true

module FormLogic
  # Every rewrite of ids inside v2 logic. v2 keeps references in typed slots
  # (`source.field`, `value` option ids, `goto`, `next_page_id`), so one walker serves all.
  module ReferenceWalker
    module_function

    # Builder save (TEMP-ID-... -> real ids), form copy, project copy and templates.
    def remap(logic, id_map)
      raise NotImplementedError
    end

    # Option deletion; drops the condition, also inside all/any groups, and empty groups.
    def drop_option(logic, option_id)
      raise NotImplementedError
    end

    # All field/option/page ids a logic hash references, for Validator and copy services.
    def references(logic)
      raise NotImplementedError
    end
  end
end
