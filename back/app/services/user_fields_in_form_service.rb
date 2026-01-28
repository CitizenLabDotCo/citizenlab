# frozen_string_literal: true

class UserFieldsInFormService
  NATIVE_SURVEYLIKE_METHODS = %w[native_survey community_monitor_survey]
  SUPPORTED_METHODS = NATIVE_SURVEYLIKE_METHODS + ['ideation']

  # This function is used to check if demographic
  # fields are collected during the reg flow (I.E. NOT in the form),
  # and if so, if they should be merged into the idea.
  def self.should_merge_user_fields_into_idea?(
    current_user,
    phase,
    idea
  )
    return false unless current_user

    # Confirm that phase is survey or ideation phase
    pmethod = phase&.participation_method
    return false unless SUPPORTED_METHODS.include?(pmethod)

    # Confirm that the idea belongs to the current user
    return false unless idea.author_id == current_user.id

    permission = phase.permissions.find_by(action: 'posting_idea')
    return false unless permission

    # Confirm that user fields are asked in registration process
    # If they are asked in the form, we know that they won't be asked
    # in the registration process
    return false if permission.user_fields_in_form_enabled?

    # If pmethod is native survey-like: confirm that user_data_collection = 'all_data' or 'demographics_only'
    return false if NATIVE_SURVEYLIKE_METHODS.include?(pmethod) && permission.user_data_collection == 'anonymous'

    # If pmethod is ideation: confirm that idea is not anonymosu
    return false if pmethod == 'ideation' && idea.anonymous

    # Finally, confirm that the idea doesn't already have user fields
    return false if idea.custom_field_values&.keys&.any? { |key| key.start_with?(prefix) }

    true
  end

  # Related to function above:
  # Actually merge user fields from the current user into
  # the idea's custom field values if fields were asked in reg flow.
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

  # This function is used to check if user fields are asked on the last
  # page of the form, and if so, if they should be merged into the user.
  def self.should_merge_user_fields_from_idea_into_user?(idea, user, phase)
    return false unless user

    # Confirm that phase is survey or ideation phase
    pmethod = phase&.participation_method
    return false unless SUPPORTED_METHODS.include?(pmethod)

    # Confirm that the idea belongs to the current user
    return false unless idea.author_id == user.id

    permission = phase.permissions.find_by(action: 'posting_idea')
    return false unless permission

    # Confirm that user fields are asked in form
    return false unless permission.user_fields_in_form_enabled?

    # If pmethod is native survey-like: only allow this if user_data_collection = 'all_data' or 'demographics_only'
    return false if NATIVE_SURVEYLIKE_METHODS.include?(pmethod) && permission.user_data_collection == 'anonymous'

    true
  end

  # Related to function above:
  # Actually update the user profile if user fields are asked as last page
  def self.merge_user_fields_from_idea_into_user!(idea, user)
    return unless user

    user_values_from_idea = idea.custom_field_values
      .select { |key, _value| key.start_with?(prefix) }
      .transform_keys { |key| key[prefix.length..] }

    user.update!(custom_field_values: user.custom_field_values.merge(user_values_from_idea))
  end

  # Append user custom fields to form
  def self.add_user_fields_to_form(fields, participation_method, custom_form)
    return fields unless participation_method.user_fields_in_form_enabled?

    phase = participation_method.phase
    permission = phase.permissions.find_by(action: 'posting_idea')
    user_fields = Permissions::UserRequirementsService.new.requirements_custom_fields(permission)

    return fields unless user_fields.any?

    fields = fields.to_a # sometimes array passed in, sometimes active record relations

    # Remove the last page so we can add it back later
    last_page = fields.pop if fields.last.form_end_page?

    # TODO: Hide any user fields that are locked for the user through the verification method

    # Transform the user fields to pretend to be idea fields
    user_fields.each do |field|
      field.dropdown_layout = true if field.supports_dropdown_layout?
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

  def self.user_fields_in_form_frontend_descriptor(permission, participation_method)
    return Permission::UNSUPPORTED_DESCRIPTOR unless permission.action == 'posting_idea'

    if %w[native_survey community_monitor_survey].include?(participation_method)
      return user_fields_in_form_frontend_descriptor_survey(permission)
    end

    if participation_method == 'ideation'
      return user_fields_in_form_frontend_descriptor_ideation(permission)
    end

    Permission::UNSUPPORTED_DESCRIPTOR
  end

  def self.prefix
    'u_'
  end

  def self.prefix_key(key)
    "#{prefix}#{key}"
  end

  private_class_method def self.user_fields_in_form_frontend_descriptor_survey(permission)
    if permission.permitted_by == 'everyone'
      if permission.user_data_collection == 'anonymous'
        {
          value: nil,
          locked: true,
          explanation: 'with_these_settings_cannot_ask_demographic_fields'
        }
      else
        {
          value: true,
          locked: true,
          explanation: 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
        }
      end
    elsif permission.user_data_collection == 'anonymous'
      {
        value: false,
        locked: true,
        explanation: 'with_these_settings_can_only_ask_demographic_fields_in_registration_flow'
      }
    else
      {
        value: permission.user_fields_in_form,
        locked: false,
        explanation: nil
      }
    end
  end

  private_class_method def self.user_fields_in_form_frontend_descriptor_ideation(permission)
    if permission.permitted_by == 'everyone'
      {
        value: true,
        locked: true,
        explanation: 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
      }
    else
      {
        value: permission.user_fields_in_form,
        locked: false,
        explanation: nil
      }
    end
  end
end
