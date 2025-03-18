class RenameNlDomicileFieldToWaardeWoonJe < ActiveRecord::Migration[7.1]
  class CustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    domicile_field = CustomField.find_by(key: 'domicile')
    return unless domicile_field

    title_multiloc = domicile_field.title_multiloc
    title_multiloc['nl-NL'] = 'Waar woon je?' if title_multiloc.key?('nl-NL')
    title_multiloc['nl-BE'] = 'Waar woon je?' if title_multiloc.key?('nl-BE')
    return if title_multiloc['nl-NL'].nil? && title_multiloc['nl-BE'].nil?

    domicile_field.update!(title_multiloc: title_multiloc)
  end
end
