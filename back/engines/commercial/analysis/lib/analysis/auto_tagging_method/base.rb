# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Base
    attr_reader :analysis

    def self.for_auto_tagging_method auto_tagging_method, *params
      case auto_tagging_method
      when 'controversial'
        AutoTaggingMethod::Controversial.new(*params)
      else
        raise ArgumentError, "Unsupported auto_tagging_method #{auto_tagging_method}"
      end
    end

    def initialize(analysis)
      @analysis = analysis
    end
  end
end
