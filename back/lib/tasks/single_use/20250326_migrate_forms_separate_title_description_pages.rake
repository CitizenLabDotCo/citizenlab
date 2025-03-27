namespace :migrate_custom_forms do
  desc 'Migrate forms to have separate pages for title and body.'
  task :separate_title_body_pages, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      CustomForm.all.each do |form|

        # Add the body page
          # Before the body field, if there previous field is not a page.
          # If the previous field is a page:
            # Turn the page into the body page if its a normal page.
            # Otherwise, insert the body page after the page.

        # Add a page after the body field, if the next field is not a page

        fields_per_page, title_page, = rake_20250326_group_field_by_page(form.custom_fields)

        # If the title page is not right before the title field, we need to either move or create it.
        if title_page && fields_per_page[title_page].first&.code != 'title_multiloc'
          title_field = fields_per_page[title_page].find { |field| field.code == 'title_multiloc' }
          next if !title_field

          real_title_page = form.custom_fields.find_by(code: 'title_page')
          if real_title_page
            # Move the existing title page to right before the title field and replace it by a normal page.
            prev_ordering = rake_20250326_reorder_and_report_page(real_title_page, title_field.ordering, reporter)
            rake_20250326_create_and_report_page(rake_20250326_new_normal_page, prev_ordering, reporter, migration)
          else
            # Create a new title page right before the title field, if it doesn't exist yet.
            rake_20250326_create_and_report_page(rake_20250326_new_title_page, title_field.ordering, reporter, 'add_title_page')
          end
        end

        fields_per_page, title_page, = rake_20250326_group_field_by_page(form.custom_fields)

        # If the title field is not the last field of the title page, start a new page after it.
        if title_page && fields_per_page[title_page].last&.code != 'title_multiloc'
          title_field = fields_per_page[title_page].find { |field| field.code == 'title_multiloc' }
          next if !title_field

          rake_20250326_create_and_report_page(rake_20250326_new_normal_page, (title_field.ordering + 1), reporter, migration)
        end

        fields_per_page, _, body_page = rake_20250326_group_field_by_page(form.custom_fields)

        # # If the body page is not right before the body field, we need to either move or create it.
        # if body_page && fields_per_page[body_page].first&.code != 'body_multiloc'
        #   body_field = fields_per_page[body_page].find { |field| field.code == 'body_multiloc' }
        #   next if !body_field

        #   real_body_page = form.custom_fields.find_by(code: 'body_page')
        #   if real_body_page
        #     # Move the existing body page to right before the body field and replace it by a normal page.
        #     prev_ordering = rake_20250326_reorder_and_report_page(real_body_page, body_field.ordering, reporter)
        #     rake_20250326_create_and_report_page(rake_20250326_new_normal_page, prev_ordering, reporter, migration)
        #   else
        #     # Create a new body page right before the body field, if it doesn't exist yet.
        #     rake_20250326_create_and_report_page(rake_20250326_new_body_page, body_field.ordering, reporter, 'add_body_page')
        #   end
        # end

        # fields_per_page, _, body_page = rake_20250326_group_field_by_page(form.custom_fields)

        # # If the body field is not the last field of the body page, start a new page after it.
        # if body_page && fields_per_page[body_page].last&.code != 'body_multiloc'
        #   body_field = fields_per_page[body_page].find { |field| field.code == 'body_multiloc' }
        #   next if !body_field

        #   rake_20250326_create_and_report_page(rake_20250326_new_normal_page, (body_field.ordering + 1), reporter, migration)
        # end
      end
      reporter.add_processed_tenant(tenant)
    end
    reporter.report!('migrate_forms_separate_title_description_pages_report.json', verbose: true)
  end
end

def rake_20250326_group_field_by_page(custom_fields)
  title_page = nil
  body_page = nil
  fields_per_page = Hash.new([])
  prev_page = nil
  custom_fields.each do |field|
    if field.page?
      break if title_page && body_page

      prev_page = field
    else
      fields_per_page[prev_page] << field

      if field.code == 'title_multiloc'
        title_page = prev_page
      elsif field.code == 'body_multiloc'
        body_page = prev_page
      end
    end
  end

  [fields_per_page, title_page, body_page]
end

def rake_20250326_new_normal_page
  CustomField.new(
    resource: form,
    input_type: 'page',
    page_layout: 'default'
  )
end

def rake_20250326_new_title_page
  CustomField.new(
    resource: form,
    input_type: 'page',
    page_layout: 'default',
    code: 'title_page',
    key: nil,
    title_multiloc: {},
    description_multiloc: begin
    MultilocService.new.i18n_to_multiloc(
        'custom_fields.ideas.title_page.description',
        locales: CL2_SUPPORTED_LOCALES
      )
    rescue StandardError
      {}
    end
  )
end

def rake_20250326_create_and_report_page(page, ordering, reporter, migration)
  if page.save
    page.insert_at(ordering)
    reporter.add_create(
      'CustomField',
      page.attributes,
      context: { tenant: Tenant.current.host, page: page.id }
    )
  else
    reporter.add_error(
      page.errors.details,
      context: { tenant: Tenant.current.host, form: form.id, migration: migration }
    )
  end
end

def rake_20250326_reorder_and_report_page(page, new_ordering, reporter)
  prev_ordering = page.ordering
  page.insert_at(new_ordering)
  reporter.add_change(
    { ordering: prev_ordering },
    { ordering: new_ordering },
    context: { tenant: Tenant.current.host, page: page.id }
  )
  prev_ordering
end
