# frozen_string_literal: true

module Verification
  class LockedAttribute
    attr_accessor :name

    def initialize(name)
      @name = name
    end

    def id
      SecureRandom.uuid
    end
  end
end
