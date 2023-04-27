# frozen_string_literal: true

module XlsxExport
  class InputSheetGenerator
    US_DATE_TIME_FORMAT = 'mm/dd/yyyy hh:mm:ss'

    def initialize(inputs, form, participation_method, include_private_attributes)
      super()
      @inputs = inputs
      @fields_in_form = IdeaCustomFieldsService.new(form).reportable_fields
      @include_private_attributes = include_private_attributes
      @participation_method = participation_method
    end

    def generate_sheet(workbook, sheetname)
      utils = Utils.new
      sheetname = utils.sanitize_sheetname sheetname
      workbook.styles do |styles|
        column_header = styles.add_style(
          b: true,
          alignment: { horizontal: :center, vertical: :top, wrap_text: true }
        )
        date_time = styles.add_style(format_code: US_DATE_TIME_FORMAT)
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
          hyperlink_indexes = all_report_fields.each_index.select do |idx|
            all_report_fields[idx].hyperlink?
          end
          utils.add_hyperlinks sheet, hyperlink_indexes
        end
      end
    end

    private

    attr_reader :inputs, :fields_in_form, :participation_method, :include_private_attributes

    def input_id_report_field
      ComputedFieldForReport.new(column_header_for('input_id'), ->(input) { input.id })
    end

    def author_name_report_field
      ComputedFieldForReport.new(column_header_for('author_fullname'), ->(input) { input.author_name })
    end

    def author_email_report_field
      ComputedFieldForReport.new(column_header_for('author_email'), ->(input) { input.author&.email })
    end

    def author_id_report_field
      ComputedFieldForReport.new(column_header_for('author_id'), ->(input) { input.author_id })
    end

    def budget_report_field
      ComputedFieldForReport.new(column_header_for('budget'), ->(input) { input.budget })
    end

    def latitude_report_field
      ComputedFieldForReport.new(column_header_for('latitude'), ->(input) { input.location_point&.coordinates&.last })
    end

    def longitude_report_field
      ComputedFieldForReport.new(column_header_for('longitude'), ->(input) { input.location_point&.coordinates&.first })
    end

    def created_at_report_field
      ComputedFieldForReport.new(column_header_for('created_at'), ->(input) { input.created_at })
    end

    def published_at_report_field
      ComputedFieldForReport.new(column_header_for('published_at'), ->(input) { input.published_at })
    end

    def comments_count_report_field
      ComputedFieldForReport.new(column_header_for('comments_count'), ->(input) { input.comments_count })
    end

    def upvotes_count_report_field
      ComputedFieldForReport.new(column_header_for('upvotes_count'), ->(input) { input.upvotes_count })
    end

    def downvotes_count_report_field
      ComputedFieldForReport.new(column_header_for('downvotes_count'), ->(input) { input.downvotes_count })
    end

    def baskets_count_report_field
      ComputedFieldForReport.new(column_header_for('baskets_count'), ->(input) { input.baskets_count })
    end

    def input_url_report_field
      ComputedFieldForReport.new(
        column_header_for('input_url'),
        ->(input) { Frontend::UrlService.new.model_to_url(input) },
        hyperlink: true
      )
    end

    def project_report_field
      ComputedFieldForReport.new(
        column_header_for('project'),
        ->(input) { MultilocService.new.t(input.project.title_multiloc) }
      )
    end

    def status_report_field
      ComputedFieldForReport.new(
        column_header_for('status'),
        ->(input) { MultilocService.new.t(input.idea_status&.title_multiloc) }
      )
    end

    def assignee_fullname_report_field
      ComputedFieldForReport.new(column_header_for('assignee_fullname'), ->(input) { input.assignee&.full_name })
    end

    def assignee_email_report_field
      ComputedFieldForReport.new(column_header_for('assignee_email'), ->(input) { input.assignee&.email })
    end

    def input_report_fields
      [input_id_report_field].tap do |input_fields|
        fields_in_form.each do |field|
          next if field.code == 'author_id' # Never included, because the user fields include it

          if field.code == 'location_description'
            input_fields << latitude_report_field
            input_fields << longitude_report_field
          end
          input_fields << CustomFieldForReport.new(field)
        end
      end
    end

    def author_report_fields
      if include_private_attributes
        [
          author_name_report_field,
          author_email_report_field,
          author_id_report_field
        ]
      else
        [author_name_report_field]
      end
    end

    def meta_report_fields
      [].tap do |meta_fields|
        meta_fields << created_at_report_field
        meta_fields << published_at_report_field if participation_method.supports_publication?
        meta_fields << comments_count_report_field if participation_method.supports_commenting?
        if participation_method.supports_voting?
          meta_fields << upvotes_count_report_field
          meta_fields << downvotes_count_report_field
        end
        meta_fields << baskets_count_report_field if participation_method.supports_baskets?
        meta_fields << budget_report_field if participation_method.supports_budget?
        meta_fields << input_url_report_field unless participation_method.never_show?
        meta_fields << project_report_field
        meta_fields << status_report_field if participation_method.supports_status?
        if participation_method.supports_assignment?
          meta_fields << assignee_fullname_report_field
          meta_fields << assignee_email_report_field if include_private_attributes
        end
      end
    end

    def user_report_fields
      user_fields.map do |field|
        if field.code == 'domicile'
          DomicileFieldForReport.new(field, :author)
        else
          CustomFieldForReport.new(field, :author)
        end
      end
    end

    def all_report_fields
      input_report_fields + author_report_fields + meta_report_fields + user_report_fields
    end

    def all_column_headers
      all_report_fields.map(&:column_header)
    end

    def all_report_field_values_for(input)
      utils = Utils.new
      all_report_fields.map do |field|
        utils.escape_formula field.value_from(input)
      end
    end

    def user_fields
      CustomField.with_resource_type('User').includes(:options).order(:ordering).all
    end

    def column_header_for(translation_key)
      I18n.t translation_key, scope: 'xlsx_export.column_headers'
    end
  end
end
