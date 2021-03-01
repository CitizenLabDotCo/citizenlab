# frozen_string_literal: true

module Callable
  ## The result object returned by #call
  class Result
    def initialize
      @errors = []
    end

    attr_accessor :error

    def success?
      error.blank?
    end

    def failure?
      error.present?
    end

    def respond_to_missing?(method_name, include_private = false)
      method_name.include?('=') || super
    end

    def method_missing(method_name, *args, &_block)
      attr_name, = method_name.to_s.split('=')

      instance_variable_set("@#{attr_name}", args.first)

      self.class.class_eval do
        attr_accessor attr_name
      end
    end
  end
end
