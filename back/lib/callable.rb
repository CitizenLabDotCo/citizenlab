# frozen_string_literal: true

require 'callable/error'
require 'callable/result'
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

      delegate :result, to: :class
    end
  end

  private

  ## The instance api method that should be used for logic
  def call
    raise_error 'Caller method not overriden.'
  end

  protected

  def raise_error(message)
    raise error_class, message || default_error_message
  end
end

require 'callable/railtie' if defined? Rails
