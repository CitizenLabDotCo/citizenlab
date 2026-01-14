# frozen_string_literal: true

module InputStrategy
  class MultilineTextMultiloc < Base
    def supports_text?
      true
    end

    def supports_multiloc?
      true
    end
  end
end
