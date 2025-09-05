class CustomFieldsValidationService
  def validate(fields, participation_method)
    validate_non_empty_form!(fields) ||
      validate_end_page!(fields) ||
      validate_first_page!(fields) ||
      validate_separate_title_body_pages!(fields) ||
      validate_lock_constraints!(fields, participation_method)
  end

  private

  def validate_non_empty_form!(fields)
    return if !fields.empty?

    { form: [{ error: 'empty' }] }
  end

  def validate_end_page!(fields)
    return if fields.last.form_end_page?

    { form: [{ error: 'no_end_page' }] }
  end

  def validate_first_page!(fields)
    return if fields.first.page?

    { form: [{ error: 'no_first_page' }] }
  end

  # TODO: Replace by locked children logic
  def validate_separate_title_body_pages!(fields)
    title_page = nil
    body_page = nil
    fields_per_page = {}
    prev_page = nil
    fields.each do |field|
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

    if title_page && body_page && title_page == body_page
      return { form: [{ error: 'title_and_body_on_same_page' }] }
    end

    if title_page && fields_per_page[title_page].count { |field| field[:enabled] } > 1
      return { form: [{ error: 'title_page_with_other_fields' }] }
    end

    if body_page && fields_per_page[body_page].count { |field| field[:enabled] } > 1
      return { form: [{ error: 'body_page_with_other_fields' }] }
    end

    nil
  end

  def validate_lock_constraints!(fields, participation_method)
    fields.each do |field|
      validate_constraints_against_defaults(field, participation_method)
    end
    nil
  end

  def validate_constraints_against_defaults(field, participation_method)
    constraints = participation_method.constraints[field.code&.to_sym]
    return unless constraints

    default_fields = participation_method.default_fields @custom_form
    default_field = default_fields.find { |f| f.code == field.code }

    constraints[:locks]&.each do |attribute, value|
      if value == true && field[attribute] != default_field[attribute] && !page1_title?(field, attribute)
        field.errors.add :constraints, "Cannot change #{attribute} from default value. It is locked." # TODO: Return error instead
      end
    end
  end
end
