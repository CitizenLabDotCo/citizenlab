# frozen_string_literal: true

module CustomFieldUserOverrides
  extend ActiveSupport::Concern

  def user_birthyear_to_json_schema_field(field, locale)
    normal_field = number_to_json_schema_field(field, locale)
    normal_field[:enum] = (1900..(Time.now.year - 12)).to_a.reverse
    normal_field
  end
end
