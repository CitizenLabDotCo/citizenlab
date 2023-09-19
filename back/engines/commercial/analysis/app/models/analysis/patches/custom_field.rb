# frozen_string_literal: true

module Analysis::Patches::CustomField
  def self.included(base)
    base.class_eval do
      has_many :analyses_custom_fields, class_name: 'Analysis::AnalysesCustomField', dependent: :destroy
    end
  end
end
