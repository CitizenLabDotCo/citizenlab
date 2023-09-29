# frozen_string_literal: true

class UserJsonSchemaGeneratorService < JsonSchemaGeneratorService
  def visit_number(field)
    return super unless field.code == 'birthyear'

    super.tap do |schema|
      years = (1900..(Time.now.year - 12)).to_a.reverse
      schema[:oneOf] = years.map { |y| { const: y } }
    end
  end

  def visit_select(field)
    return super unless field.code == 'domicile'

    super.tap do |schema|
      areas = Area.order(:ordering).map do |area|
        {
          const: area.id,
          title: multiloc_service.t(area.title_multiloc)
        }
      end
      areas.push({
        const: 'outside',
        title: I18n.t('custom_field_options.domicile.outside')
      })
      schema[:enum] = areas.pluck(:const)
    end
  end
end
