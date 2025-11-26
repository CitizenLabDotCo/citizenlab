# frozen_string_literal: true

module InputStrategy
  class SelectImage < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_option_images?
      true
    end
  end
end
