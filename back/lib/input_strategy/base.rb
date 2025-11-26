# frozen_string_literal: true

module InputStrategy
  class Base
    def initialize(custom_field)
      @custom_field = custom_field
    end

    def supports_average?
      false
    end

    def supports_options?
      false
    end

    def supports_other_option?
      false
    end

    def supports_option_images?
      false
    end

    def supports_follow_up?
      false
    end

    def supports_text?
      false
    end

    def supports_linear_scale?
      false
    end

    def supports_linear_scale_labels?
      false
    end

    def supports_matrix_statements?
      false
    end

    def supports_single_selection?
      false
    end

    def supports_multiple_selection?
      false
    end

    def supports_selection?
      supports_single_selection? || supports_multiple_selection?
    end

    def supports_select_count?
      false
    end

    def supports_free_text_value?
      supports_text? || (supports_options? && custom_field.includes_other_option?) || supports_follow_up?
    end

    protected

    attr_reader :custom_field
  end
end
