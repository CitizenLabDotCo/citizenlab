# frozen_string_literal: true

module InputTypeStrategy
  class Checkbox < Base
    def supports_reference_distribution?
      true
    end
  end
end
