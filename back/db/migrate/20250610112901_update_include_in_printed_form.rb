class UpdateIncludeInPrintedForm < ActiveRecord::Migration[7.1]
  def change
    CustomField
      .where(input_type: 'page', key: nil, include_in_printed_form: false)
      .update_all(include_in_printed_form: true)
    CustomField
      .where(input_type: 'page', key: 'form_end', include_in_printed_form: true)
      .update_all(include_in_printed_form: false)
  end
end
