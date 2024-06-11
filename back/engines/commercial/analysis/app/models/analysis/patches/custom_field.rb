# frozen_string_literal: true

module Analysis::Patches::CustomField
  def self.included(base)
    base.class_eval do
      has_many :analyses_custom_fields, class_name: 'Analysis::AdditionalCustomField', dependent: :destroy
      has_many :main_analyses, class_name: 'Analysis::Analysis', dependent: :nullify, foreign_key: :main_custom_field_id
    end
  end
end
