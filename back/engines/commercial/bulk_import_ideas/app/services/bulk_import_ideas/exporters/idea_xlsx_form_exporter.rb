# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaXlsxFormExporter < BaseFormExporter
    def export
      locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
      locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
      locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }

      columns = {
        locale_first_name_label => 'Bill',
        locale_last_name_label => 'Test',
        locale_email_label => 'bill@govocal.com',
        locale_permission_label => 'X',
        locale_published_label => Time.zone.today.strftime('%d-%m-%Y')
      }

      xlsx_utils = Export::Xlsx::Utils.new
      @form_fields.each do |field|
        column_name = xlsx_utils.add_duplicate_column_name_suffix(custom_field_service.handle_title(field, @locale))

        value = case field.input_type
        when 'select'
          custom_field_service.handle_title(field.options.first, @locale)
        when 'multiselect', 'multiselect_image'
          field.options.map { |o| custom_field_service.handle_title(o, @locale) }.join '; '
        when 'topic_ids'
          @project.allowed_input_topics.map { |t| t.title_multiloc[@locale] }.join '; '
        when 'number', 'linear_scale'
          field.maximum || 3
        else
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        end
        columns[column_name] = value
      end

      unless @participation_method.supports_survey_form?
        locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
        locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
        locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }

        columns[locale_image_url_label] = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png'
        columns[locale_latitude_label] = 50.5035
        columns[locale_longitude_label] = 6.0944
      end

      XlsxService.new.hash_array_to_xlsx [columns]
    end

    def format
      'xlsx'
    end

    def mime_type
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    end

    def filename
      'form.xlsx'
    end

    def importer_data
      fields = @form_fields.map do |field|
        {
          name: custom_field_service.handle_title(field, @locale),
          type: 'field',
          input_type: field[:input_type],
          code: field[:code],
          key: field[:key],
          parent_key: nil,
          page: 1,
          position: nil
        }
      end
      options = @form_fields.map do |field|
        field.ordered_transformed_options.map do |option|
          {
            name: custom_field_service.handle_title(option, @locale),
            type: 'option',
            input_type: 'option',
            code: option[:code],
            key: option[:key],
            parent_key: field[:key],
            page: 1,
            position: nil
          }
        end
      end

      {
        page_count: 1,
        fields: fields + options.flatten
      }
    end
  end
end
