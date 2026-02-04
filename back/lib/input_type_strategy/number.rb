# frozen_string_literal: true

module InputTypeStrategy
  class Number < Base
    def supports_average?
      true
    end

    def supports_reference_distribution?
      custom_field.code == 'birthyear'
    end
  end
end
