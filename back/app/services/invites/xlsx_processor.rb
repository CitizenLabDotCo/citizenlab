# frozen_string_literal: true

class Invites::XlsxProcessor
  def initialize(error_storage, custom_field_schema)
    @error_storage = error_storage
    @custom_field_schema = custom_field_schema
  end

  def param_to_hash_array(xlsx_param)
    # Strip out data;...base64 prefix if it's there
    start = xlsx_param.index(';base64,')
    pure_base64 = start ? xlsx_param[(start + 8)..] : xlsx_param

    xlsx_file = StringIO.new(Base64.decode64(pure_base64))

    map_rows = []
    old_row = 0
    hash_array = XlsxService.new.xlsx_to_hash_array(xlsx_file).select do |invite_params|
      if invite_params.present?
        map_rows += [old_row]
      end
      old_row += 1
      invite_params.present?
    end

    postprocess_xlsx_hash_array(hash_array)

    [hash_array, map_rows]
  end

  private

  def postprocess_xlsx_hash_array(hash_array)
    hash_array.each.with_index do |hash, row_index|
      @current_row = row_index
      if hash['groups']
        hash['group_ids'] = xlsx_groups_to_group_ids(hash['groups'])
      end
      hash.delete('groups')

      if hash['admin'].present?
        hash['roles'] = xlsx_admin_to_roles(hash['admin'])
      end
      hash.delete('admin')

      if hash['language'].present?
        hash['locale'] = hash['language']
      end
      hash.delete('language')

      if hash['send_invite_email'].present?
        hash['send_invite_email'] = Utils.to_bool(hash['send_invite_email'])
      end

      coerce_custom_field_types(hash)
    end
  rescue StandardError => e
    @error_storage.add_error(:unparseable_excel, raw_error: e.to_s)
    @error_storage.fail_now
  ensure
    @current_row = nil
  end

  def xlsx_groups_to_group_ids(groups)
    groups.split(',').filter_map do |group_title|
      stripped_group_title = group_title.strip
      group = Group.all.find { |g| g.title_multiloc.values.map(&:strip).include? stripped_group_title }&.id
      group || (@error_storage.add_error(:unknown_group, row: @current_row, value: stripped_group_title) && nil)
    end
  rescue StandardError => e
    @error_storage.add_error(:malformed_groups_value, row: @current_row, value: groups, raw_error: e.to_s)
    []
  end

  def xlsx_admin_to_roles(admin)
    if [true, 'TRUE', 'true', '1', 1].include? admin
      [{ 'type' => 'admin' }]
    elsif [false, 'FALSE', 'false', '0', 0].include? admin
      []
    else
      @error_storage.add_error(:malformed_admin_value, row: @current_row, value: admin)
      []
    end
  end

  # @param [Hash]
  # @return [Hash]
  def coerce_custom_field_types(hash)
    hash.each do |field, value|
      if (type = custom_field_types[field]) # only runs for custom fields
        hash[field] = coerce_value(value, type)
      end
    rescue ArgumentError => e
      @error_storage.add_error(:malformed_custom_field_value, row: @current_row, value: value, raw_error: e)
    end
  end

  # Returns type information of custom fields.
  #
  # @return [Hash<String, String>] Mapping from field key to field type
  def custom_field_types
    @custom_field_schema[:properties].transform_values { |field_schema| field_schema[:type] }
  end

  # Converts a value to a given type.
  #
  # @param [Object] value any kind of value
  # @param [String] type destination type ('number', 'boolean' or 'string')
  # @return [String, Float, Integer, Boolean]
  def coerce_value(value, type)
    case type
    when 'number' then Utils.to_number(value)
    when 'boolean' then Utils.to_bool(value)
    when 'string' then String(value)
    end
  end
end
