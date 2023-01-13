# frozen_string_literal: true

module UserCustomFields::Patches::CustomField
  def self.included(base)
    base.class_eval do
      # TODO: (tech debt) Refactor CustomFields to use STI with two types: UserCustomField & FormCustomField
      # `UserCustomField` would replace this patch (and live in the `user_custom_fields` engine)
      # and `FormCustomField` would belong to the core.
      has_many(
        :ref_distributions,
        class_name: 'UserCustomFields::Representativeness::RefDistribution'
      )

      # The callback that destroys the dependent reference distributions must be
      # prepended in order to be executed before the callback that destroys the
      # dependent custom field options. Otherwise, each option deletion would trigger
      # an unnecessary update of the current reference distribution.
      #
      # Since the +:dependent+ option of +has_many+ does not support the prepending of
      # callbacks, we us +:before_destroy+.
      before_destroy :destroy_ref_distributions, prepend: true
    end
  end

  def current_ref_distribution
    ref_distributions.order(created_at: :desc).first
  end

  private

  def destroy_ref_distributions
    ref_distributions.destroy_all
  end
end
