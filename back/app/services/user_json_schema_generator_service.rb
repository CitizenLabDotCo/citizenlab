# frozen_string_literal: true

class UserJsonSchemaGeneratorService < JsonSchemaGeneratorService
  def visit_number(field)
    return super unless field.code == 'birthyear'

    app_configuration = AppConfiguration.instance

    min_age = app_configuration.settings('core', 'min_user_age') || 12

    super.tap do |schema|
      years = (1900..(Time.now.year - min_age)).to_a.reverse
      schema[:oneOf] = years.map { |y| { const: y } }
    end
  end
end
