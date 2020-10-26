# frozen_string_literal: true

module Finder
  ## include to allow finders to perform authorization
  module Pundit
    def verify_policy_scoped
      @_pundit_policy_scoped ||= @result&.performed_authorization
      super
    end
  end
end
