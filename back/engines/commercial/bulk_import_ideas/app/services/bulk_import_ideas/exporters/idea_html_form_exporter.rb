# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlFormExporter < BaseFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super
      @form_fields = IdeaCustomFieldsService.new(phase.pmethod.custom_form).printable_fields
      @personal_data_enabled = personal_data_enabled
      organization_name = AppConfiguration.instance.settings('core', 'organization_name')[@locale]
      personal_data_visibility = @phase.pmethod.supports_public_visibility? ? 'public' : 'private'

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
        personal_data: {
          enabled: @personal_data_enabled,
          heading: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.personal_data') },
          intro: I18n.with_locale(@locale) do
            I18n.t(
              "form_builder.pdf_export.personal_data_explanation_#{personal_data_visibility}",
              organizationName: organization_name
            )
          end,
          first_name: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') },
          last_name: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') },
          email_address: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') },
          checkbox: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box', organizationName: organization_name) }
        },
        optional: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') },
        logo_url: AppConfiguration.instance.logo&.medium&.url,
        page_copy: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
      }
    end

    def export
      ActionController::Base.new.render_to_string render_config
    end

    def format
      'html'
    end

    def mime_type
      'application/html'
    end

    private

    def render_config
      {
        template: 'bulk_import_ideas/web_api/v1/export_form',
        formats: [:html],
        layout: false,
        locals: @template_values
      }
    end
  end
end
