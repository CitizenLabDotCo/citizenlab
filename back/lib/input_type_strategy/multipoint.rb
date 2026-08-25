# frozen_string_literal: true

module InputTypeStrategy
  class Multipoint < Geographic
    def supports_select_count?
      true
    end
  end
end
