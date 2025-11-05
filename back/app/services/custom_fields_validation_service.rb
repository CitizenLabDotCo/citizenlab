class CustomFieldsValidationService
  def validate(fields, participation_method)
    validate_non_empty_form(fields) ||
      validate_first_page(fields) ||
      validate_end_page(fields) ||
      validate_lock_constraints(fields, participation_method)
  end

  private

  def validate_non_empty_form(fields)
    return if !fields.empty?

    { form: [{ error: 'empty' }] }
  end

  def validate_first_page(fields)
    return if fields.first.page?

    { form: [{ error: 'no_first_page' }] }
  end

  def validate_end_page(fields)
    return if fields.last.form_end_page?

    { form: [{ error: 'no_end_page' }] }
  end

  def validate_lock_constraints(fields, participation_method)
    default_fields = participation_method.default_fields(participation_method.custom_form)

    validate_deletions(fields, participation_method) ||
      validate_attributes(fields, default_fields, participation_method)
  end

  def validate_deletions(fields, participation_method)
    participation_method.constraints.each do |code, constraint|
      next if !constraint.dig(:locks, :deletion)

      if !fields.find { |f| f.code == code.to_s && f.enabled? }
        return { form: [{ error: 'locked_deletion' }] }
      end
    end

    nil
  end

  def validate_attributes(fields, default_fields, participation_method)
    fields.each do |field|
      field_constraints = participation_method.constraints[field.code&.to_sym]
      next if !field_constraints

      default_field = default_fields.find { |f| f.code == field.code }
      # TODO: Remove and check constraints for default community monitoring fields when the form is persisted.
      next if !default_field

      field_constraints.dig(:locks, :attributes)&.each do |attribute|
        # Extra check to make sure we don't return an error if the attribute remains unchanged.
        persisted_field = participation_method.custom_form.custom_fields.find { |find_field| find_field.code == field.code }
        next if persisted_field && persisted_field.send(attribute) == field[attribute]

        if field[attribute] != default_field.send(attribute)
          return { form: [{ error: 'locked_attribute' }] }
        end
      end
    end

    nil
  end
end
