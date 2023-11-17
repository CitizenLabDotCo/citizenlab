# frozen_string_literal: true

require 'verification/engine'

module Verification
  mattr_accessor(:all_methods) { [] }

  class << self
    def add_method(verification_method)
      all_methods.reject! { |m| m.id == verification_method.id }
      all_methods << verification_method
    end
  end
end
