module IdeaCustomFields
  class IdeaCustomFields::CustomForm < ApplicationRecord
    has_one :project
    has_many :custom_fields, as: :resource, dependent: :destroy
  end
end
