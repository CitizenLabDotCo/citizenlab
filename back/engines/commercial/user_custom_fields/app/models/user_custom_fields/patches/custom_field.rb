# frozen_string_literal: true

module UserCustomFields::Patches::CustomField
  def self.included(base)
    base.class_eval do
      # TODO: Refactor CustomFields to use STI and add the following only to user custom fields.
      has_many(
        :ref_distributions,
        class_name: 'UserCustomFields::Representativeness::RefDistribution',
        dependent: :destroy
      )
    end
  end
end
