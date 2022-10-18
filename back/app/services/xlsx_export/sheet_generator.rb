# frozen_string_literal: true

module XlsxExport
  class SheetGenerator
    def initialize(inputs, form, participation_method, include_private_attributes)
      super()
      @inputs = inputs
      @fields_in_form = IdeaCustomFieldsService.new(form).all_fields.reject do |field|
        not_supported?(field)
      end
      @include_private_attributes = include_private_attributes
      @participation_method = participation_method
    end

    def generate_sheet(workbook, sheetname)
      sheetname = sanitize_sheetname sheetname
      workbook.styles do |styles|
        column_header = styles.add_style(b: true, alignment: { horizontal: :center, vertical: :top, wrap_text: true })
        date_time = styles.add_style(format_code: 'mm/dd/yyyy hh:mm:ss')
        workbook.add_worksheet(name: sheetname) do |sheet|
          sheet.add_row all_column_headers, style: column_header
          inputs.each do |input|
            values = all_report_field_values_for input
            sheet.add_row do |row|
              values.each do |value|
                options = {}
                if value.is_a?(ActiveSupport::TimeWithZone)
                  options[:style] = date_time
                end
                row.add_cell(value, options)
              end
            end
          end
        end
      end
    end

    private

    attr_reader :inputs, :fields_in_form, :participation_method, :include_private_attributes

    def options_for(field)
      @options ||= {}
      @options[field] ||= field.options.index_by(&:key)
    end

    def not_supported?(field)
      field.code == 'idea_images_attributes' # Not supported by XlsxService
    end

    def input_report_fields
      [
        SpecialFieldForReport.new('id', column_header_for('input_id'))
      ].tap do |input_fields|
        fields_in_form.each do |field|
          if field.code == 'location_description'
            input_fields << ComputedFieldForReport.new('latitude', column_header_for('latitude'), ->(input) { input.location_point&.coordinates&.last })
            input_fields << ComputedFieldForReport.new('longitude', column_header_for('longitude'), ->(input) { input.location_point&.coordinates&.first })
          end
          input_fields << CustomFieldForReport.new(field)
        end
      end
    end

    def author_report_fields
      if include_private_attributes
        [
          SpecialFieldForReport.new('author_name', column_header_for('author_fullname')),
          SpecialFieldForReport.new('email', column_header_for('author_email'), :author),
          SpecialFieldForReport.new('id', column_header_for('author_id'), :author)
        ]
      else
        [
          SpecialFieldForReport.new('author_name', column_header_for('author_fullname'))
        ]
      end
    end

    def column_header_for(translation_key)
      I18n.t translation_key, scope: 'xlsx_export.column_headers'
    end

    def meta_report_fields
      [].tap do |meta_fields|
        meta_fields << SpecialFieldForReport.new('created_at', column_header_for('created_at'))
        meta_fields << SpecialFieldForReport.new('published_at', column_header_for('published_at')) if participation_method.supports_publication?
        meta_fields << SpecialFieldForReport.new('comments_count', column_header_for('comments_count')) if participation_method.supports_commenting?
        if participation_method.supports_voting?
          meta_fields << SpecialFieldForReport.new('upvotes_count', column_header_for('upvotes_count'))
          meta_fields << SpecialFieldForReport.new('downvotes_count', column_header_for('downvotes_count'))
        end
        meta_fields << SpecialFieldForReport.new('baskets_count', column_header_for('baskets_count')) if participation_method.supports_baskets?
        unless participation_method.never_show?
          meta_fields << ComputedFieldForReport.new('url', column_header_for('input_url'), ->(input) { Frontend::UrlService.new.model_to_url(input) })
        end
        meta_fields << ComputedFieldForReport.new('project', column_header_for('project'), ->(input) { MultilocService.new.t(input.project.title_multiloc) })
        if participation_method.supports_status?
          meta_fields << ComputedFieldForReport.new('status', column_header_for('status'), ->(input) { MultilocService.new.t(input.idea_status&.title_multiloc) })
        end
        if participation_method.supports_assignment?
          meta_fields << SpecialFieldForReport.new('full_name', column_header_for('assignee_fullname'), :assignee)
          meta_fields << SpecialFieldForReport.new('email', column_header_for('assignee_email'), :assignee) if include_private_attributes
        end
      end
    end

    def user_report_fields
      user_fields.map do |field|
        CustomFieldForReport.new(field, :author)
      end
    end

    def all_report_fields
      input_report_fields + author_report_fields + meta_report_fields + user_report_fields
    end

    def all_column_headers
      all_report_fields.map(&:column_header)
    end

    def all_report_field_values_for(input)
      all_report_fields.map do |field|
        field.value_from input
      end
    end

    def user_fields
      CustomField.with_resource_type('User').includes(:options).enabled.order(:ordering).all
    end

    # Sanitize sheet names to comply with Excel naming restrictions.
    # See: https://support.microsoft.com/en-us/office/rename-a-worksheet-3f1f7148-ee83-404d-8ef0-9ff99fbad1f9
    def sanitize_sheetname(sheetname)
      invalid_chars = '?*:[]/\\'
      sanitized_name = sheetname.tr(invalid_chars, '')
      sanitized_name = strip_char(sanitized_name, "'")
      sanitized_name = sanitized_name[0..30]

      if sanitized_name.empty? || sanitized_name == 'History'
        raise InvalidSheetnameError.new(sheetname, sanitized_name)
      end

      sanitized_name
    end

    # Return a copy of the string with the leading and trailing +char+ removed.
    # @param [String] string
    # @param [String] char a single character
    def strip_char(string, char)
      string.gsub(/^#{char}+|#{char}+$/, '')
    end
  end
end
