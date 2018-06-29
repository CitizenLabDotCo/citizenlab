class Clustering < ApplicationRecord

  validates :title_multiloc, presence: true, multiloc: {presence: true}

  STRUCTURE_JSON_SCHEMA = Rails.root.join('config', 'schemas', 'clustering_structure.json_schema').to_s
  validates :structure, json: { schema: STRUCTURE_JSON_SCHEMA, message: ->(errors) { errors } }


end
