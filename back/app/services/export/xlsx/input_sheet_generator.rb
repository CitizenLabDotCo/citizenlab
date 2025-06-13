module Export
  module Xlsx
    class InputSheetGenerator
      US_DATE_TIME_FORMAT = 'mm/dd/yyyy hh:mm:ss'

      def initialize(inputs, phase)
        @inputs = inputs
        @phase = phase
        @include_private_attributes = phase.pmethod.supports_private_attributes_in_export?
        @participation_method = phase.pmethod
        @value_visitor = Xlsx::ValueVisitor
        @fields_in_form = IdeaCustomFieldsService.new(participation_method.custom_form).xlsx_exportable_fields
        @multiloc_service = MultilocService.new(app_configuration: AppConfiguration.instance)
        @url_service = Frontend::UrlService.new
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
              values = all_report_field_values_for(input)
              styles = values.map do |value|
                value.is_a?(ActiveSupport::TimeWithZone) ? date_time : nil
              end

              sheet.add_row(values, style: styles)
            end
            hyperlink_indexes = all_report_fields.each_index.select do |idx|
              all_report_fields[idx].hyperlink?
            end
            utils.add_hyperlinks sheet, hyperlink_indexes
          end
        end
      end

      private

      attr_reader :inputs, :phase, :fields_in_form, :participation_method, :include_private_attributes, :multiloc_service, :url_service

      def input_id_report_field
        ComputedFieldForReport.new(column_header_for('input_id'), ->(input) { input.id })
      end

      def author_name_report_field
        ComputedFieldForReport.new(column_header_for('author_fullname'), ->(input) { format_author_name input })
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

      def matrix_statement_report_field(statement)
        ComputedFieldForReport.new(
          multiloc_service.t(statement.title_multiloc),
          ->(input) { input.custom_field_values.dig(statement.custom_field.key, statement.key) }
        )
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

      def likes_count_report_field
        ComputedFieldForReport.new(column_header_for('likes_count'), ->(input) { input.likes_count })
      end

      def dislikes_count_report_field
        ComputedFieldForReport.new(column_header_for('dislikes_count'), ->(input) { input.dislikes_count })
      end

      def neutral_reactions_count_report_field
        ComputedFieldForReport.new(column_header_for('neutral_reactions_count'), ->(input) { input.neutral_reactions_count })
      end

      def baskets_count_report_field(column_header_key)
        ComputedFieldForReport.new(column_header_for(column_header_key), ->(input) { voting_context(input, phase).baskets_count })
      end

      def votes_count_report_field
        ComputedFieldForReport.new(column_header_for('votes_count'), ->(input) { voting_context(input, phase).votes_count })
      end

      def manual_votes_amount_report_field
        ComputedFieldForReport.new(column_header_for('manual_votes'), ->(input) { input.manual_votes_amount })
      end

      def input_url_report_field
        ComputedFieldForReport.new(
          column_header_for('input_url'),
          ->(input) { url_service.model_to_url(input) },
          hyperlink: true
        )
      end

      def project_report_field
        ComputedFieldForReport.new(
          column_header_for('project'),
          ->(input) { multiloc_service.t(input.project.title_multiloc) }
        )
      end

      def status_report_field
        ComputedFieldForReport.new(
          column_header_for('status'),
          ->(input) { multiloc_service.t(input.idea_status&.title_multiloc) }
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
            if field.input_type == 'matrix_linear_scale'
              field.matrix_statements.each do |statement|
                input_fields << matrix_statement_report_field(statement)
              end
              next
            end
            input_fields << Export::CustomFieldForExport.new(field, @value_visitor)
            input_fields << Export::CustomFieldForExport.new(field.other_option_text_field, @value_visitor) if field.other_option_text_field
            input_fields << Export::CustomFieldForExport.new(field.follow_up_text_field, @value_visitor) if field.follow_up_text_field
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
          [
            author_id_report_field
          ]
        end
      end

      def meta_report_fields
        [].tap do |meta_fields|
          meta_fields << created_at_report_field
          meta_fields << published_at_report_field if participation_method.supports_public_visibility?
          meta_fields << comments_count_report_field if participation_method.supports_commenting?
          meta_fields << likes_count_report_field if participation_method.supports_reacting?('up')
          meta_fields << dislikes_count_report_field if participation_method.supports_reacting?('down')
          meta_fields << neutral_reactions_count_report_field if participation_method.supports_reacting?('neutral')
          meta_fields << baskets_count_report_field('picks') if participation_method.additional_export_columns.include? 'picks'
          meta_fields << baskets_count_report_field('participants') if participation_method.additional_export_columns.include? 'participants'
          meta_fields << votes_count_report_field if participation_method.additional_export_columns.include? 'votes'
          meta_fields << budget_report_field if participation_method.additional_export_columns.include? 'budget'
          meta_fields << manual_votes_amount_report_field if participation_method.additional_export_columns.include? 'manual_votes'
          meta_fields << input_url_report_field if participation_method.supports_public_visibility?
          meta_fields << project_report_field
          meta_fields << status_report_field if participation_method.supports_status?
          if participation_method.supports_assignment?
            meta_fields << assignee_fullname_report_field if include_private_attributes
            meta_fields << assignee_email_report_field if include_private_attributes
          end
        end
      end

      def user_report_fields
        return [] if participation_method.user_fields_in_form? # User fields are returned from the idea if they are included in the form

        registration_fields.map do |field|
          Export::CustomFieldForExport.new(field, @value_visitor, :author)
        end
      end

      def all_report_fields
        @all_report_fields ||= input_report_fields + author_report_fields + meta_report_fields + user_report_fields
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

      def registration_fields
        @registration_fields ||= CustomField.registration.includes(:options).order(:ordering).all
      end

      def voting_context(input, phase)
        phase.ideas_phases.find_by(idea_id: input.id)
      end

      def column_header_for(translation_key)
        I18n.t translation_key, scope: 'xlsx_export.column_headers'
      end

      def format_author_name(input)
        return input.author_name unless input.anonymous?

        I18n.t 'xlsx_export.anonymous'
      end
    end
  end
end
