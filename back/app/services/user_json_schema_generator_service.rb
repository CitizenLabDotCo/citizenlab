# frozen_string_literal: true

class UserJsonSchemaGeneratorService < JsonSchemaGeneratorService
  def visit_number(field)
    return super unless field.code == 'birthyear'

    super.tap do |schema|
      years = (1900..(Time.now.year - 12)).to_a.reverse
      schema[:oneOf] = years.map { |y| { const: y } }
    end
  end
end
