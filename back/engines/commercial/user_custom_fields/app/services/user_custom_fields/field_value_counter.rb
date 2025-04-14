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
    # @param [ActiveRecord::Relation] records - users OR ideas
    # @param [UserCustomField] user_custom_field
    # @param [Symbol] by index the counts by
    #   - option id if +by+ is +:option_id+
    #   - area id if +by+ is +:area_id+ (only for domicile field)
    #   - option key otherwise.
    # @param [String] record_type - are the records passed in users (default) or ideas
    # @return [ActiveSupport::HashWithIndifferentAccess]
    def self.counts_by_field_option(records, custom_field, by: :option_key, record_type: 'users')
      field_values = select_field_values(records, custom_field, record_type)

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

      # TODO: Tech debt of CL-959.
      # CL-959 adds custom field options to the domicile custom field. Before CL-959, the
      # domicile custom field was a select custom field without options
      # (CustomFieldOption records associated to it). Instead, the options were implicitly
      # defined by the areas (Area model). As a consequence, the user custom field values are
      # using the area id as the field value, instead of the option key (as for the other
      # select custom fields).
      #
      # We have to run a data migration to update the user custom field values to use the
      # option key for domicile before we can remove the following conversion step.
      convert_area_ids_to_option_keys!(counts, custom_field) if by != :area_id && custom_field.domicile?
      raise ArgumentError, <<~MSG if by == :area_id && !custom_field.domicile?
        'by: :area_id' option can only be used with domicile custom field.
      MSG

      convert_keys_to_option_ids!(counts, custom_field) if by == :option_id
      counts.with_indifferent_access
    end

    # Returns an ActiveRecord::Relation of all the user custom field values for the given records (users or ideas).
    # Ideas are supported so that surveys that allow user fields in the survey form can be analyzed.
    # It returns a view (result set) with a single column named 'field_value'. Essentially,
    # something that looks like:
    #   SELECT ... AS field_value FROM ...
    #
    # Each user results in one or multiple rows, depending on the type of custom field.
    # Custom fields with multiple values (e.g. multiselect) are returned as multiple rows.
    # If the custom field has no value for a given user or idea, the resulting row contains NULL.
    private_class_method def self.select_field_values(records, custom_field, record_type)
      field_key = record_type == 'ideas' ? "u_#{custom_field.key}" : custom_field.key
      case custom_field.input_type
      when 'select', 'checkbox', 'number'
        records.select("custom_field_values->'#{field_key}' as field_value")
      when 'multiselect'
        records.joins(<<~SQL.squish).select('cfv.field_value as field_value')
          LEFT JOIN (
            SELECT
              jsonb_array_elements(custom_field_values->'#{field_key}') as field_value,
              id as record_id
            FROM #{record_type}
          ) as cfv
          ON #{record_type}.id = cfv.record_id
        SQL
      else
        raise NotSupportedFieldTypeError
      end
    end

    private_class_method def self.convert_area_ids_to_option_keys!(counts, custom_field)
      raise 'custom_field is not the domicile field' unless custom_field.domicile?

      area_id_to_option_key = Area.includes(:custom_field_option)
        .all.to_h { |area| [area.id, area.custom_field_option.key] }

      # Adding special keys to the mapping
      somewhere_else_option = custom_field.options.left_joins(:area).find_by(areas: { id: nil })
      area_id_to_option_key['outside'] = somewhere_else_option.key
      area_id_to_option_key[FieldValueCounter::UNKNOWN_VALUE_LABEL] = FieldValueCounter::UNKNOWN_VALUE_LABEL

      counts.transform_keys! { |key| area_id_to_option_key.fetch(key) }
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
      if custom_field.domicile?
        option_keys = Area.ids << 'outside'
      elsif custom_field.options.present?
        option_keys = custom_field.options.pluck(:key)
      else
        return counts
      end

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
