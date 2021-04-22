# frozen_string_literal: true

module Finder
  ## Finder::Helpers
  module Inflectors
    def _klass
      return @_klass if @_klass || !Object.const_defined?(_klass_string)

      @_klass = _klass_string.constantize
    end

    def _klass_string
      @_klass_string ||= self.class.name.gsub('Finder', '').singularize
    end
  end
end
