# frozen_string_literal: true

class AddTypeToUserCustomFieldsRepresentativenessRefDistributions < ActiveRecord::Migration[6.1]
  def change
    add_column :user_custom_fields_representativeness_ref_distributions, :type, :string

    execute(<<~SQL.squish)
      UPDATE user_custom_fields_representativeness_ref_distributions
      SET type = 'UserCustomFields::Representativeness::CategoricalDistribution'
    SQL
  end
end
