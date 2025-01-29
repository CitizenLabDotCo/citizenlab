# frozen_string_literal: true

namespace :cl2back do
  desc 'Adds a new post-submission page to all existing surveys with correct logic'
  task add_last_survey_pages: :environment do
    Rails.logger.info 'cl2back:add_last_survey_pages started'

    Tenant.all.each do |tenant|
      tenant.switch do
        Rails.logger.info "Adding last survey pages #{tenant.name}"

        # Get all the custom forms that are surveys
        survey_custom_forms = CustomForm.where(participation_context_type: 'Phase')
        survey_custom_forms.each do |custom_form|
          custom_fields = custom_form.custom_fields

          # Get the last field of the survey, check if it's already the correct last page.
          # If so, skip this form
          last_field = custom_fields.last
          next if last_field.input_type == 'page' && last_field.key == 'survey_end'

          # Create the new last page
          multiloc_service = MultilocService.new

          last_page = CustomField.new(
            id: SecureRandom.uuid,
            key: 'survey_end',
            resource: custom_form,
            input_type: 'page',
            page_layout: 'default',
            title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
            description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
          )

          # Replace previous mentions of 'survey_end' with the new last page id
          # TODO
        end
      end
    end
  end
end
