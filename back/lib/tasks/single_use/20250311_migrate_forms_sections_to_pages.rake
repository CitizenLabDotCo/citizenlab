namespace :migrate_custom_forms do
  desc 'Migrate section-separated forms to page-separated forms.'
  task :sections_to_pages, [] => [:environment] do
    reporter = ScriptReporter.new
    section2page_codes = {
      'ideation_section1' => 'ideation_page1',
      'ideation_section2' => 'ideation_page2',
      'ideation_section3' => 'ideation_page3'
    }
    Tenant.safe_switch_each do |tenant|
      # Section to page
      CustomField.where(input_type: 'section').each do |section|
        new_code = section2page_codes[section.code] || section.code
        section.assign_attributes(
          input_type: 'page',
          page_layout: 'default',
          code: new_code
        )
        if !section.save
          reporter.add_error(
            section.errors.details,
            context: { tenant: tenant.host, section: section.id, migration: 'section_to_page' }
          )
        end
      end

      # Add end page
      CustomForm.all.each do |form|
        next if form.custom_fields.exists?(input_type: 'page', code: 'survey_end')

        end_page = CustomField.new(
          key: 'survey_end',
          resource: form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
          description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
        )
        if !end_page.save
          reporter.add_error(
            end_page.errors.details,
            context: { tenant: tenant.host, form: form.id, migration: 'add_end_page' }
          )
        end
      end
    end
    reporter.report!('migrate_forms_sections_to_pages_report.json', verbose: true)
  end
end
