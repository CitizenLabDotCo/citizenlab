module IdeaCustomFields
  class IdeaCustomFields::CustomForm < ApplicationRecord
    has_one :project, foreign_key: 'idea_custom_fields_custom_form_id'
    has_many :custom_fields, as: :resource, dependent: :destroy
  end
end
