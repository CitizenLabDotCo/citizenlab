# frozen_string_literal: true

module UserCustomFields
  # This module can be used to count the number of times each custom field option
  # has been selected by a user (within a group of users).
  module FieldValueCounter
    UNKNOWN_VALUE_LABEL = '_blank'

    # Counts the number of users by custom field option. The counts are indexed by
    # the option key by default. The resulting hash also includes a special entry for users
    # who do not have a value for the custom field. The key of this entry is equal to
    # +UNKNOWN_VALUE_LABEL+.
    #
    # @param [ActiveRecord::Relation] users
    # @param [UserCustomField] user_custom_field
    # @param [Boolean] by_option_id index the counts by the option id instead of the option key
    # @return [ActiveSupport::HashWithIndifferentAccess]
    def self.counts_by_field_option(users, custom_field, by_option_id: false)
      field_values = select_field_values(users, custom_field)

      # Warning: The method +count+ cannot be used here because it introduces a SQL syntax
      # error while rewriting the SELECT clause. This is because the 'field_value' column is a
      # computed column and it does not seem to be supported properly by the +count+ method.
      counts = field_values
        .order('field_value')
        .group('field_value')
        .select('COUNT(*) as count')
        .to_a.pluck(:field_value, :count).to_h

      counts[UNKNOWN_VALUE_LABEL] = counts.delete(nil) || 0
      counts = add_missing_options(counts, custom_field)
      convert_keys_to_option_ids!(counts, custom_field) if by_option_id
      counts.with_indifferent_access
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

    private_class_method def self.convert_keys_to_option_ids!(counts, custom_field)
      key_to_id = custom_field.options.to_h { |option| [option.key, option.id] }
      counts.transform_keys! do |option_key|
        next option_key if option_key == UNKNOWN_VALUE_LABEL

        key_to_id.fetch(option_key)
      end
    end

    # Adds zero counts for missing options to the counts hash. Hash keys are the option
    # keys (not the option ids).
    #
    # It only adds missing options when they are explicitly defined (as
    # +CustomFieldOption+ records). This is not the case for number and checkbox
    # custom fields whose options are implicitly defined.
    #
    # @raise [ArgumentError] if the custom field values are not consistent with the
    #   custom field options. That is if the custom field values reference options that
    #   do not exist.
    private_class_method def self.add_missing_options!(counts, custom_field)
      return counts if custom_field.options.empty?

      option_keys = custom_field.options.pluck(:key)
      unknown_option_keys = counts.keys - option_keys - [UNKNOWN_VALUE_LABEL]
      raise ArgumentError, <<~MSG.squish if unknown_option_keys.present?
        The `counts` hash keys are inconsistent with the custom field options
        (unknown option keys: #{unknown_option_keys.join(', ')}).
      MSG

      option_keys.index_with { 0 }.merge(counts)
    end

    # Same as +add_missing_options!+ but does not raise an error when it detects data
    # inconsistencies. Instead, it returns the counts unchanged and reports the error
    # without failing.
    private_class_method def self.add_missing_options(counts, custom_field)
      add_missing_options!(counts, custom_field)
    rescue ArgumentError => e
      ErrorReporter.report(e)
      counts
    end
  end
end
