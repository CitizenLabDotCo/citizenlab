# frozen_string_literal: true

module Finder
  ## Defines the sorting methods used by a Finder.
  module Sortable
    extend ActiveSupport::Concern

    def self.included(base)
      base.class_eval do
        extend ClassMethods
      end
    end

    # Finder::Sortable::ClassMethods
    module ClassMethods
      attr_reader :_default_sort, :_default_sort_order

      def sort_scopes(scopes)
        _sort_scopes.merge!(scopes.with_indifferent_access)
      end

      def sort_scope(scope_name, blk_or_options)
        _sort_scopes[scope_name] = blk_or_options
      end

      def default_sort(scope)
        @_default_sort, @_default_sort_order = scope.first if scope.is_a? Hash

        @_default_sort_order = scope.to_s.delete_prefix!('-') ? :asc : :desc
        @_default_sort       = scope.to_s
      end

      def sortable_attributes(*attributes)
        _sortable_attributes.concat(attributes.map(&:to_s))
      end

      def sortable_attribute(attribute)
        _sortable_attributes.push(attribute.to_s)
      end

      def _sortable_attributes
        @_sortable_attributes ||= []
      end

      def _sort_scopes
        @_sort_scopes ||= {}.with_indifferent_access
      end
    end

    attr_accessor :_sort_method

    private

    delegate :_default_sort, :_default_sort_order, :_sortable_attributes, :_sort_scopes, to: :class

    def _sort_records
      @_sort_method = _default_sort || params[:sort]
      return unless _sort_method

      if _sort_scopes&.key? _sort_method
        _sort_with_method
      elsif _sortable_attributes.include? _sort_method_suffix
        _sort_with_attribute
      end
    end

    def _sort_with_method
      sort_option = _sort_scopes[_sort_method.to_sym]

      @records = case sort_option
                 when ->(so) { so.respond_to?(:call) } then  sort_option.call(@records)
                 when Hash                             then  _sort_from_hash(sort_option)
                 when Symbol                           then  @records.send(sort_option)
                 else                                        @records.order(sort_option)
                 end
    end

    def _sort_from_hash(hash)
      sort_scope, sort_order = hash.first

      if @records.respond_to?(sort_scope)
        @records.send(sort_scope, sort_order)
      else
        @records.order(hash)
      end
    end

    def _sort_with_attribute
      attribute = _sort_method_suffix.include?('.') ? _sort_method_suffix : "#{table_name}.#{_sort_method_suffix}"

      order(attribute => _sort_order)
    end

    def _sort_method_suffix
      @_sort_method_suffix ||= _sort_method.delete_prefix('-')
    end

    def _sort_order
      _sort_method.start_with?('-') ? 'desc' : 'asc'
    end
  end
end
