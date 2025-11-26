# frozen_string_literal: true

module InputStrategy
  class Rating < Base
    def supports_average?
      true
    end
  end
end
