# frozen_string_literal: true

# This migration comes from user_custom_fields (originally 20220415065934)
class CreateUserCustomFieldsRepresentativenessRefDistributions < ActiveRecord::Migration[6.1]
  def change
    create_table :user_custom_fields_representativeness_ref_distributions, id: :uuid do |t|
      t.references :custom_field, type: :uuid, null: false, foreign_key: true, index: { name: 'index_ucf_representativeness_ref_distributions_on_custom_field' }
      t.jsonb :distribution, null: false

      t.timestamps
    end
  end
end
