# frozen_string_literal: true

class UserFieldsInSurveyService
  def self.merge_user_fields_into_idea(
    current_user,
    phase,
    idea_custom_field_values
  )
    return idea_custom_field_values unless current_user
    return idea_custom_field_values if phase.blank?

    permission = phase.permissions.find_by(action: 'posting_idea')

    # Use PermissionsCustomFieldsService to get fields, which handles both persisted and non-persisted (global) fields
    permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new
    permissions_custom_fields = permissions_custom_fields_service.fields_for_permission(permission)

    allowed_keys = permissions_custom_fields.map { |pcf| pcf.custom_field.key }.uniq

    user_values = current_user
      .custom_field_values
      .select { |key, _value| allowed_keys.include?(key) }
      .transform_keys do |key|
        prefix_key(key)
      end

    (user_values || {}).merge(idea_custom_field_values || {})
  end

  def self.add_user_fields_to_form(fields, participation_method, custom_form)
    return fields unless participation_method.user_fields_in_form?

    phase = custom_form.participation_context
    permission = phase.permissions.find_by(action: 'posting_idea')
    user_fields = Permissions::UserRequirementsService.new.requirements_custom_fields(permission)

    return fields unless user_fields.any?

    fields = fields.to_a # sometimes array passed in, sometimes active record relations

    # Remove the last page so we can add it back later
    last_page = fields.pop if fields.last.form_end_page?

    # TODO: Hide any user fields that are locked for the user through the verification method

    # Transform the user fields to pretend to be idea fields
    user_fields.each do |field|
      field.dropdown_layout = true if field.dropdown_layout_type?
      field.code = nil # Remove the code so it doesn't appear as built in
      field.key = prefix_key(field.key) # Change the key so we cans clearly identify user data in the saved data
      field.resource = custom_form # User field pretend to be part of the form
    end

    user_page = CustomField.new(
      id: SecureRandom.uuid,
      key: 'user_page',
      title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.form_user_page.title_text'),
      resource: custom_form,
      input_type: 'page',
      page_layout: 'default'
    )

    # Change any logic end pages to reference the user page instead
    fields.each do |field|
      if field.logic['rules']
        field.logic['rules'].map! do |rule|
          rule['goto_page_id'] = user_page.id if rule['goto_page_id'] == last_page.id
          rule
        end
      elsif field.logic['next_page_id'] == last_page.id
        field.logic['next_page_id'] = user_page.id
      end
    end

    fields + [user_page] + user_fields + [last_page]
  end

  def self.prefix
    'u_'
  end

  # This function is used to check if demographic
  # fields are collected during the registration process,
  # and if so, if we want to merge them into the idea.
  def self.should_merge_user_fields_into_idea?(
    current_user,
    phase,
    idea
  )
    return false unless current_user

    # Confirm that phase is survey phase
    return false unless phase&.participation_method == 'native_survey'

    # Confirm that the idea belongs to the current user
    return false unless idea.author_id == current_user.id

    # Confirm that user fields are asked in registration process
    # If they are asked in the form, we know that they won't be asked
    # in the registration process
    return false if phase.pmethod.user_fields_in_form?

    # Confirm that user fields are asked at all
    permission = phase.permissions.find_by(action: 'posting_idea')
    return false unless permission

    requirements = Permissions::UserRequirementsService.new.requirements(permission, nil)
    return false unless requirements[:custom_fields]

    return false if requirements[:custom_fields].empty?

    # Confirm that user_data_collection = 'all_data' or 'demographics_only'
    return false if permission.user_data_collection == 'anonymous'

    # Finally, confirm that the idea doesn't already have user fields
    return false if idea.custom_field_values&.keys&.any? { |key| key.start_with?(prefix) }

    true
  end

  def self.prefix_key(key)
    "#{prefix}#{key}"
  end
end
