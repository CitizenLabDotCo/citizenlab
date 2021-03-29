# This migration comes from idea_custom_fields (originally 20210315123927)
class MigrateCustomFormResourceTypeInCustomFields < ActiveRecord::Migration[6.0]
  def change
    CustomField.where(resource_type: 'CustomForm')
                .update(resource_type: 'IdeaCustomFields::CustomForm')
  end
end
