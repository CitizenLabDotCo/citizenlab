# frozen_string_literal: true

namespace :single_use do
  desc 'Adds a new post-submission page to all existing surveys with correct logic'
  task add_last_survey_pages: :environment do
    reporter = ScriptReporter.new

    def save_field_and_report(original_field, new_field, reporter, tenant)
      if new_field.save
        reporter.add_change(
          original_field.attributes,
          new_field.attributes,
          context: { tenant: tenant.host }
        )
      else
        reporter.add_error(
          new_field.errors.details,
          context: { tenant: tenant.host }
        )
      end
    end

    Rails.logger.info 'single_use:add_last_survey_pages started\n\n'

    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Adding last survey pages #{tenant.name}\n\n"

      # Get all the custom forms that are surveys
      survey_custom_forms = CustomForm.where(participation_context_type: 'Phase')
      survey_custom_forms.each do |custom_form|
        # We sort the custom field by ordering to make sure we have the correct order
        custom_fields = custom_form
          .custom_fields
          .sort_by(&:ordering)

        # Get the last field of the survey, check if it's already the correct last page.
        # If so, skip this form
        last_field = custom_fields.last
        next if last_field.form_end_page?

        # Create the new last page
        multiloc_service = MultilocService.new

        last_page = CustomField.new(
          id: SecureRandom.uuid,
          key: 'form_end',
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
          description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
        )

        if last_page.save
          reporter.add_create(
            'CustomField',
            last_page.attributes,
            context: { tenant: tenant.host }
          )
        else
          reporter.add_error(
            last_page.errors.details,
            context: { tenant: tenant.host }
          )
          next
        end

        # Replace previous mentions of 'form_end' with the new last page id
        custom_fields.each do |field|
          original_field = field.deep_dup

          if field.page?
            if field.logic['next_page_id'] == 'form_end'
              field.logic['next_page_id'] = last_page.id
              save_field_and_report(original_field, field, reporter, tenant)
            end
          else
            any_field_updated = false

            rules = field.logic['rules']
            if rules.present?
              rules.each do |rule|
                if rule['goto_page_id'] == 'form_end'
                  rule['goto_page_id'] = last_page.id
                  any_field_updated = true
                end
              end

              if any_field_updated
                save_field_and_report(original_field, field, reporter, tenant)
              end
            end
          end
        end
      end
    end

    reporter.report!('add_last_survey_pages.json', verbose: true)
  end
end
