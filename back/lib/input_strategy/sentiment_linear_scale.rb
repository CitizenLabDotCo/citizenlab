# frozen_string_literal: true

module InputStrategy
  class SentimentLinearScale < Base
    def supports_average?
      true
    end
  end
end
