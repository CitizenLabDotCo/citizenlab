class AddFirstFieldMustBePageConstraint < ActiveRecord::Migration[7.2]
  def change
    check = "(resource_type != 'CustomForm' OR ordering != 0 OR input_type = 'page')"
    add_check_constraint :custom_fields, check, name: 'custom_form_first_field_must_be_page', validate: false
  end
end
