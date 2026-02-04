# frozen_string_literal: true

module InputTypeStrategy
  class Base
    def initialize(custom_field)
      @custom_field = custom_field
    end

    def page?
      false
    end

    def supports_submission?
      !page?
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
      supports_linear_scale?
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

    def supports_dropdown_layout?
      false
    end

    def supports_free_text_value?
      supports_text? || (supports_options? && custom_field.includes_other_option?) || supports_follow_up?
    end

    def supports_xlsx_export?
      true
    end

    def supports_geojson?
      true
    end

    def supports_printing?
      custom_field.enabled? && custom_field.include_in_printed_form
    end

    def supports_pdf_llm_import?
      supports_printing?
    end

    def supports_pdf_import?
      supports_pdf_llm_import?
    end

    def supports_xlsx_import?
      true
    end

    # Whether this field supports comparison against a reference population distribution
    # for representativeness analysis. Only fields with discrete/categorical values qualify.
    def supports_reference_distribution?
      false
    end

    def supports_file_upload?
      false
    end

    def supports_logic?
      false
    end

    protected

    attr_reader :custom_field
  end
end
