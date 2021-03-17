class MigrateCustomFormResourceTypeInCustomFields < ActiveRecord::Migration[6.0]
  def change
    Tenant.switch_each do |_|
      CustomField.where(resource_type: 'IdeaCustomFields::CustomForm')
                 .update(resource_type: 'IdeaCustomFields::CustomForm')
    end
  end
end
