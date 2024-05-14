class SchemaField
  def initialize(custom_field)
    @custom_field = custom_field
  end

  def input_type
    @custom_field.input_type
  end
end
