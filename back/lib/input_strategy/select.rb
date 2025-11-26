# frozen_string_literal: true

module InputStrategy
  class Select < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_single_selection?
      true
    end
  end
end
