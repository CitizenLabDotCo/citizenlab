# frozen_string_literal: true

# This is used to solve Pundits limitation of only allowing one policy per model
# https://github.com/elabs/pundit/issues/241

module PublicApi
  class PolicyWrappedUser < SimpleDelegator
    def self.policy_class
      PublicApi::UserPolicy
    end
  end
end
