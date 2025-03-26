namespace :migrate_custom_forms do
  desc 'Migrate forms to have separate pages for title and body.'
  task :separate_title_body_pages, [] => [:environment] do
    multiloc_service = MultilocService.new
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      # Rename survey_end to form_end
      CustomField.where(input_type: 'page', key: 'survey_end').update_all(key: 'form_end')

      # Section to page
      CustomField.where(input_type: 'section').each do |section|
        attrs_before = section.attributes
        new_code = section2page_codes[section.code] || section.code
        section.assign_attributes(
          input_type: 'page',
          page_layout: 'default',
          code: new_code
        )
        if section.save
          reporter.add_change(
            attrs_before,
            section.attributes,
            context: { tenant: tenant.host, section: section.id }
          )
        else
          reporter.add_error(
            section.errors.details,
            context: { tenant: tenant.host, section: section.id, migration: 'section_to_page' }
          )
        end
      end

      # Add end page
      CustomForm.all.each do |form|
        next if form.custom_fields.exists?(input_type: 'page', key: 'form_end')

        end_page = CustomField.new(
          key: 'form_end',
          resource: form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
          description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
        )
        if end_page.save
          reporter.add_create(
            'CustomField',
            end_page.attributes,
            context: { tenant: tenant.host, page: end_page.id }
          )
        else
          reporter.add_error(
            end_page.errors.details,
            context: { tenant: tenant.host, form: form.id, migration: 'add_end_page' }
          )
        end
      end
      reporter.add_processed_tenant(tenant)
    end
    reporter.report!('migrate_forms_sections_to_pages_report.json', verbose: true)
  end
end
