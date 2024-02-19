# frozen_string_literal: true

module Analysis::Patches::CustomField
  def self.included(base)
    base.class_eval do
      # TODO: add main field dependent destroy + delete if no fields associated anymore (other model) + specs
      has_many :analyses_custom_fields, class_name: 'Analysis::AdditionalCustomField', dependent: :destroy
    end
  end
end
