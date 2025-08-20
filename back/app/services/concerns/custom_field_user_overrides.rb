# frozen_string_literal: true

module CustomFieldUserOverrides
  extend ActiveSupport::Concern

  def user_birthyear_to_json_schema_field(field, locale, app_configuration)
    normal_field = number_to_json_schema_field(field, locale)

    min_age = app_configuration.settings('core', 'min_user_age') || 12

    normal_field[:enum] = (1900..(Time.now.year - min_age)).to_a.reverse
    normal_field
  end
end
