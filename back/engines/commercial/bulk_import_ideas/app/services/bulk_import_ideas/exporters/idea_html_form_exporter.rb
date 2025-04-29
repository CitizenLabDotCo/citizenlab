module BulkImportIdeas::Exporters
  class IdeaHtmlFormExporter < BaseFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super
      @form_fields = IdeaCustomFieldsService.new(phase.pmethod.custom_form).printable_fields
      @personal_data_enabled = personal_data_enabled

      @template_values = {
        locale: @locale,
        phase: @phase,
        project: @project,
        form_fields: @form_fields,
        instructions: {
          title: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.instructions') },
          bullet1: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.write_as_clearly') },
          bullet2: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.write_in_language') }
        },
        optional: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') },
        logo_url: AppConfiguration.instance.logo&.medium&.url,
        page_copy: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
      }
    end

    def export
      nil
    end

    def render_config
      {
        template: 'bulk_import_ideas/web_api/v1/export_form',
        formats: [:html],
        layout: false,
        locals: @template_values
      }
    end

    def mime_type
      'application/html'
    end

    def format
      'html'
    end

    def html_based?
      true
    end
  end
end
