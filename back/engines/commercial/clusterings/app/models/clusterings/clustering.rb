# == Schema Information
#
# Table name: clusterings
#
#  id             :uuid             not null, primary key
#  title_multiloc :jsonb
#  structure      :jsonb
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
module Clusterings
  class Clustering < ApplicationRecord
    self.table_name = 'clusterings'

    validates :title_multiloc, presence: true, multiloc: {presence: true}

    STRUCTURE_JSON_SCHEMA = Clusterings::Engine.root.join('config', 'schemas', 'clustering_structure.json_schema').to_s
    validate :structure_json_schema_validation
    ## We do json schema validation explicitely because
    ## otherwise validation takes forever. No idea why,
    ## but looks like an issue with the gem.
    # validates :structure, json: { schema: STRUCTURE_JSON_SCHEMA, message: ->(errors) { errors } }


    private

    def structure_json_schema_validation
      if !JSON::Validator.validate(STRUCTURE_JSON_SCHEMA, structure)
        errors.add(:structure, :json_schema_invalid, message: 'is not valid according to json schema')
      end
    end


  end
end
