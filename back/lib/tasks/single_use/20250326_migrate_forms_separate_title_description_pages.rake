namespace :migrate_custom_forms do
  desc 'Migrate forms to have separate pages for title and body.'
  task :separate_title_body_pages, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      {
        'ideation_page1' => 'title_page',
        'ideation_page2' => 'uploads_page',
        'ideation_page3' => 'details_page'
      }.each do |code_from, code_to|
        CustomField.where(input_type: 'page', code: code_from).update_all(code: code_to)
      end

      CustomForm.all.each do |form|
        # Move disabled fields to the end of the form
        end_page = form.custom_fields.find_by(key: 'form_end')
        if end_page
          form.custom_fields.disabled.each do |field|
            rake_20250326_reorder_and_report_field(field, end_page.ordering, reporter, 'move_disabled_fields')
          end
        end

        # Add the body page in front of the body field
        fields_per_page, _, body_page = rake_20250326_group_field_by_page(form.reload.custom_fields)
        if body_page
          body_field = fields_per_page[body_page]&.find { |field| field.code == 'body_multiloc' }
          next if !body_field # This should not be possible, but just in case.

          field_before_body = fields_per_page[body_page].find { |field| field.ordering == (body_field.ordering - 1) } || body_page
          if field_before_body.page? && !field_before_body.code
            # If the previous field is a page, we turn it into the body page, instead of adding a second page.
            rake_20250326_turn_into_body_and_report_page(field_before_body, reporter, 'add_body_page')
          end

          if !form.custom_fields.exists?(input_type: 'page', code: 'body_page') # If the previous field wasn't a normal page turned into the body page, and for idempotency.
            rake_20250326_create_and_report_page(rake_20250326_new_body_page(form), body_field.ordering, reporter, 'add_body_page')
          end
        end

        # If the body field is not the last endabled field of the body page, start a new page after
        # it. Unless the body field is followed by the title field, in which case a new title page
        # will be created in the next steps.
        fields_per_page, _, body_page = rake_20250326_group_field_by_page(form.reload.custom_fields)
        if body_page && fields_per_page[body_page].present? && fields_per_page[body_page].reverse.find(&:enabled)&.code != 'body_multiloc' && fields_per_page[body_page].second&.code != 'title_multiloc'
          rake_20250326_create_and_report_page(rake_20250326_new_normal_page(form), (body_field.reload.ordering + 1), reporter, 'add_body_page')
        end

        # If the title page is not right before the title field, we need to either move or create it.
        fields_per_page, title_page, = rake_20250326_group_field_by_page(form.reload.custom_fields)
        real_title_page = form.custom_fields.find_by(code: 'title_page')
        if title_page
          title_field = fields_per_page[title_page]&.find { |field| field.code == 'title_multiloc' }
          next if !title_field # This should not be possible, but just in case.

          if real_title_page
            if fields_per_page[title_page].first&.code != 'title_multiloc'
              # Move the existing title page to right before the title field and replace it by a normal page, if the next field is not a page.
              next_real_title_page_field = form.custom_fields.find_by(ordering: (real_title_page.ordering + 1))
              prev_ordering = rake_20250326_reorder_and_report_field(real_title_page, title_field.ordering, reporter, 'add_title_page')
              if !next_real_title_page_field.page?
                rake_20250326_create_and_report_page(rake_20250326_new_normal_page(form), prev_ordering, reporter, 'add_title_page')
              end
            end
          elsif fields_per_page[title_page].first&.code == 'title_multiloc'
            rake_20250326_turn_into_title_and_report_page(title_page, reporter, 'add_title_page')
          else
            # Create a new title page right before the title field, if it doesn't exist yet.
            rake_20250326_create_and_report_page(rake_20250326_new_title_page(form), title_field.ordering, reporter, 'add_title_page')
          end
        end

        # If the title field is not the last disabled field of the title page, start a new page after it.
        fields_per_page, title_page, = rake_20250326_group_field_by_page(form.reload.custom_fields)
        if title_page && fields_per_page[title_page].reverse.find(&:enabled)&.code != 'title_multiloc'
          title_field = fields_per_page[title_page].find { |field| field.code == 'title_multiloc' }
          next if !title_field # This should not be possible, but just in case.

          rake_20250326_create_and_report_page(rake_20250326_new_normal_page(form), (title_field.ordering + 1), reporter, 'add_title_page')
        end
      end
      reporter.add_processed_tenant(tenant)
    end
    reporter.report!('migrate_forms_separate_title_description_pages_report.json', verbose: true)
  end
end

def rake_20250326_group_field_by_page(custom_fields)
  title_page = nil
  body_page = nil
  fields_per_page = {}
  prev_page = nil
  custom_fields.each do |field|
    if field.page?
      break if title_page && body_page

      prev_page = field
    else
      fields_per_page[prev_page] ||= []
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

def rake_20250326_new_normal_page(form)
  CustomField.new(
    resource: form,
    input_type: 'page',
    page_layout: 'default'
  )
end

def rake_20250326_new_title_page(form)
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

def rake_20250326_new_body_page(form)
  CustomField.new(
    resource: form,
    input_type: 'page',
    page_layout: 'default',
    code: 'body_page',
    key: nil,
    title_multiloc: MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.body_page.title',
      locales: CL2_SUPPORTED_LOCALES
    ),
    description_multiloc: begin
      MultilocService.new.i18n_to_multiloc(
        'custom_fields.ideas.body_page.description',
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
      context: { tenant: Tenant.current.host, page: page.id, migration: }
    )
  else
    reporter.add_error(
      page.errors.details,
      context: { tenant: Tenant.current.host, form: page.custom_form.id, migration: }
    )
  end
end

def rake_20250326_turn_into_title_and_report_page(page, reporter, migration)
  attrs_before = {
    code: page.code,
    key: page.key,
    title_multiloc: page.title_multiloc,
    description_multiloc: page.description_multiloc
  }
  attrs_after = {
    code: 'title_page',
    key: nil,
    title_multiloc: page.title_multiloc,
    description_multiloc: page.description_multiloc
  }
  if page.title_multiloc.blank?
    attrs_after[:title_multiloc] = MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.title.title',
      locales: CL2_SUPPORTED_LOCALES
    )
  end
  if page.description_multiloc.blank?
    attrs_after[:description_multiloc] = begin
      MultilocService.new.i18n_to_multiloc(
        'custom_fields.ideas.title.description',
        locales: CL2_SUPPORTED_LOCALES
      )
    rescue StandardError
      {}
    end
  end
  page.assign_attributes(attrs_after)
  if page.save
    reporter.add_change(
      attrs_before,
      attrs_after,
      context: { tenant: Tenant.current.host, page: page.id, migration: }
    )
  else
    reporter.add_error(
      page.errors.details,
      context: { tenant: Tenant.current.host, form: page.custom_form.id, migration: }
    )
  end
end

def rake_20250326_turn_into_body_and_report_page(page, reporter, migration)
  attrs_before = {
    code: page.code,
    key: page.key,
    title_multiloc: page.title_multiloc,
    description_multiloc: page.description_multiloc
  }
  attrs_after = {
    code: 'body_page',
    key: nil,
    title_multiloc: page.title_multiloc,
    description_multiloc: page.description_multiloc
  }
  if page.title_multiloc.blank?
    attrs_after[:title_multiloc] = MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.body_page.title',
      locales: CL2_SUPPORTED_LOCALES
    )
  end
  if page.description_multiloc.blank?
    attrs_after[:description_multiloc] = begin
      MultilocService.new.i18n_to_multiloc(
        'custom_fields.ideas.body_page.description',
        locales: CL2_SUPPORTED_LOCALES
      )
    rescue StandardError
      {}
    end
  end
  page.assign_attributes(attrs_after)
  if page.save
    reporter.add_change(
      attrs_before,
      attrs_after,
      context: { tenant: Tenant.current.host, page: page.id, migration: }
    )
  else
    reporter.add_error(
      page.errors.details,
      context: { tenant: Tenant.current.host, form: page.custom_form.id, migration: }
    )
  end
end

def rake_20250326_reorder_and_report_field(field, new_ordering, reporter, migration)
  prev_ordering = field.ordering
  new_ordering -= 1 if prev_ordering < new_ordering
  field.insert_at(new_ordering)
  reporter.add_change(
    { ordering: prev_ordering },
    { ordering: new_ordering },
    context: { tenant: Tenant.current.host, field: field.id, migration: }
  )
  prev_ordering
end
