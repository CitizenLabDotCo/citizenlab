# frozen_string_literal: true

module UserCustomFields::Patches::CustomField
  def self.included(base)
    base.class_eval do
      # TODO: Refactor CustomFields to use STI with two types: UserCustomField & FormCustomField
      # `UserCustomField` would replace this patch (and live in the `user_custom_fields` engine)
      # and `FormCustomField` would belong to the core.
      has_many(
        :ref_distributions,
        class_name: 'UserCustomFields::Representativeness::RefDistribution',
        dependent: :destroy
      )
    end
  end
end
