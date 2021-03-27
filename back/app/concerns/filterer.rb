# The Filterer mixin can help you to implement filtering services that applies a sequence of filter.
# The mixin allows the registration of new filters to the filtering service.
#
# Usage:
#
# > class StringFilterer
# >   include Filterer
# >   add_filter("swap case") { |string| string.swapcase }
# > end
# > StringFilterer.new.filter("AnONymOuS")                    # => "aNonYMoUs"
#
# > StringFilterer.add_filter("call method") do |str, opts|
# >   opts[:method] ? str.send(opts[:method]) : str
# > end
# > StringFilterer.filter("AnONymOuS", method: :reverse)      # => "aNonYMoUs"
# > StringFilterer.filters.map(&:name)                        # => ["swap case", "call method"]

module Filterer

  def self.included(base) #:nodoc:
    base.extend ClassMethods
  end

  def filter(object, options={})
    self.class.filters.inject(object) { |object, filter| filter.apply(object, self, options)  }
  end

  module ClassMethods
    # @return [Array<Filter>]
    def filters
      @filters ||= []
    end

    # @param [String] name name of the filter
    # @param [Proc] block
    def add_filter(name, &block)
      filters << Filter.new(name, &block)
    end
  end

  class Filter
    attr_reader :name, :block

    # @param [String] name name of the filter
    # @param [Proc] block
    def initialize(name, &block)
      @name, @block = name, block
    end

    # The context is most useful when the filter needs to access instance variables (e.g. to store partial results).
    # But we should try to avoid that kind of stateful filters and try to stick to functional filters that take
    # an object as input and just returns the object filtered according the +options+.
    #
    # @param [Object] context the context (self) in which the block of the filter will be executed.
    def apply(scope, context=nil, options={})
      (context || self).instance_exec(scope, options, &block)
    end
  end

end