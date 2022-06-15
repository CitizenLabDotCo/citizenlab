# frozen_string_literal: true

module UserCustomFields
  module FieldValueCounter
    def self.counts_by_field_option(users, custom_field)
      field_values = select_field_values(users, custom_field)

      # Warning: The method +count+ cannot be used here because it introduces a SQL syntax
      # error while rewriting the SELECT clause. This is because the 'field_value' column is a
      # computed column and it does not seem to be supported properly by the +count+ method.
      counts = field_values
        .order('field_value')
        .group('field_value')
        .select('COUNT(*) as count')
        .to_a.pluck(:field_value, :count).to_h

      counts['_blank'] = counts.delete(nil) || 0
      counts
    end

    # Returns an ActiveRecord::Relation of all the custom field values for the given users.
    # It returns a view (result set) with a single column named 'field_value'. Essentially,
    # something that looks like:
    #   SELECT ... AS field_value FROM ...
    #
    # Each user results in one or multiple rows, depending on the type of custom field.
    # Custom fields with multiple values (e.g. multiselect) are returned as multiple rows.
    # If the custom field has no value for a given user, the resulting row contains NULL.
    private_class_method def self.select_field_values(users, custom_field)
      case custom_field.input_type
      when 'select', 'checkbox', 'number'
        users.select("custom_field_values->'#{custom_field.key}' as field_value")
      when 'multiselect'
        users.joins(<<~SQL.squish).select('cfv.field_value as field_value')
          LEFT JOIN (
            SELECT
              jsonb_array_elements(custom_field_values->'#{custom_field.key}') as field_value,
              id as user_id
            FROM users
          ) as cfv
          ON users.id = cfv.user_id
        SQL
      else
        raise NotSupportedFieldTypeError
      end
    end
  end
end
