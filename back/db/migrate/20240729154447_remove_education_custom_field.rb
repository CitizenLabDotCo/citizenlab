class RemoveEducationCustomField < ActiveRecord::Migration[7.0]
  class CustomField < ApplicationRecord
    self.table_name = 'custom_fields'
    has_many :custom_field_options, dependent: :destroy
  end

  class CustomFieldOption < ApplicationRecord
    self.table_name = 'custom_field_options'
  end

  def up
    return if Apartment::Tenant.current == 'public'

    education_custom_field = CustomField.where(code: 'education', resource_id: nil).sole
    education_custom_field.destroy!
  end
end
