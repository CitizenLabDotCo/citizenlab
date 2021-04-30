# frozen_string_literal: true

require 'callable/error'
require 'callable/result'
require 'callable/methods'
require 'callable/class_methods'

## A mixin that exposes a class method #call that returns a Result object
#
#
# CallableObject.call(*args)
#
module Callable
  extend ActiveSupport::Autoload

  DEFAULT_ERROR_CLASS = Callable::Error.freeze
  DEFAULT_ERROR_MESSAGE = 'Something went wrong.'

  def self.included(base)
    base.class_eval do
      extend Callable::ClassMethods
      include Callable::Methods
    end
  end
end

require 'callable/railtie' if defined? Rails
