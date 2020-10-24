# frozen_string_literal: true

## Ex
#
#
# Class.call(*args)
#
module Callable
  def self.included(base)
    base.class_eval do
      class << self
        def call(*args)
          new(*args).call
        end
      end
    end
  end
end
