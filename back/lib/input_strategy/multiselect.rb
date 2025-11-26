# frozen_string_literal: true

module InputStrategy
  class Multiselect < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end
  end
end
