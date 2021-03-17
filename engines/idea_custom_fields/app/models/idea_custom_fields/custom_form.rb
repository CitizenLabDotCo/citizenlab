module IdeaCustomFields
  class IdeaCustomFields::CustomForm < ApplicationRecord
    self.table_name = 'custom_forms'

    has_one :project
    has_many :custom_fields, as: :resource, dependent: :destroy
  end
end
