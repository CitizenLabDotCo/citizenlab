# frozen_string_literal: true

class BulkImportIdeas::IdeaXlsxFormExporter < BulkImportIdeas::BaseFormExporter
  def export
    locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
    locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
    locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
    locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
    locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }

    columns = {
      locale_first_name_label => 'Bill',
      locale_last_name_label => 'Test',
      locale_email_label => 'bill@citizenlab.co',
      locale_permission_label => 'X',
      locale_published_label => '18-07-2022'
    }

    @form_fields.each do |field|
      column_name = field.title_multiloc[@locale]
      value = case field.input_type
      when 'select'
        field.options.first.title_multiloc[@locale]
      when 'multiselect', 'multiselect_image'
        field.options.map { |o| o.title_multiloc[@locale] }.join '; '
      when 'topic_ids'
        @project.allowed_input_topics.map { |t| t.title_multiloc[@locale] }.join '; '
      when 'number', 'linear_scale'
        field.maximum || 3
      when 'point'
        rand(0.1..89.9).round(5)
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

  def mime_type
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  end

  def filename
    'form.xlsx'
  end
end
