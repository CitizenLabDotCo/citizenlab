# This is used to solve Pundits limitation of only allowing one policy per model
# https://github.com/elabs/pundit/issues/241

module PublicApi
  class PolicyWrappedIdea < SimpleDelegator

    def self.policy_class
      PublicApi::IdeaPolicy
    end
  end
end