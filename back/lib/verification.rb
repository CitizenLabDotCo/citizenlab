# frozen_string_literal: true

module Verification
  # This array `all_methods` is populated in `to_prepare` callbacks in Engines,
  # and it's used to define the `VerificationMethodSerializer` attributes.
  # When the code is autoreloaded, VerificationMethodSerializer is loaded BEFORE
  # calling to_prepare callbacks, which means that `all_methods` is empty at the time.
  # And so, no attributes are defined in the serializer.
  # So, all_methods is defined here (in not-autoreloaded code), to keep it from
  # resetting to empty when the code is autoreloaded.
  #
  mattr_accessor(:all_methods) { [] }

  class << self
    def add_method(verification_method)
      all_methods.reject! { |m| m.id == verification_method.id }
      all_methods << verification_method
    end
  end
end
