# frozen_string_literal: true

module IdMethods
  # This array `all_methods` is populated in `to_prepare` callbacks in Engines,
  # and it's used to define the `VerificationMethodSerializer` attributes.
  # When the code is autoreloaded, VerificationMethodSerializer is loaded BEFORE
  # calling to_prepare callbacks, which means that `all_methods` is empty at the time.
  # And so, no attributes are defined in the serializer.
  # So, all_methods is defined here (in not-autoreloaded code), to keep it from
  # resetting to empty when the code is autoreloaded.
  # (Luuc: not sure what this comment means, but it's not really accurate
  # anymore since we sorted out the whole verification terminology.
  # but the stuff about the auto reloading might still be relevant, so I left it in.)
  mattr_accessor(:all_methods) { [] }

  class << self
    def add_method(id_method)
      all_methods.reject! { |m| m.id == id_method.id }
      all_methods << id_method
    end
  end
end
