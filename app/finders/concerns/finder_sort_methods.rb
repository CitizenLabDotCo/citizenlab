# frozen_string_literal: true

## Defines the sorting methods used by a Finder.
module FinderSortMethods
  extend ActiveSupport::Concern

  class_methods do
    attr_reader :_sort_scopes, :_default_sort, :_default_sort_order

    def sort_scopes(scopes)
      @_sort_scopes = scopes.with_indifferent_access
    end

    def default_sort(scope)
      @_default_sort, @_default_sort_order = scope.first if scope.is_a? Hash

      @_default_sort_order = scope.to_s.delete_prefix!('-') ? :asc : :desc
      @_default_sort = scope.to_s
    end

    def sortable_attributes(*attributes)
      @_sortable_attributes = attributes
    end

    def _sortable_attributes
      @_sortable_attributes ||= []
    end
  end

  # rubocop:disable Metrics/BlockLength
  included do
    private

    delegate :_default_sort, :_default_sort_order, :_sortable_attributes, :_sort_scopes, to: :class

    def _sort_records
      self.sort_param ||= _default_sort
      if _sort_scopes.key? _sort_method
        _sort_with_method
      elsif _sortable_attributes.include? _sort_method
        _sort_with_attribute
      end
    end

    def _sort_with_method
      sort_option = _sort_scopes[_sort_method.to_sym]
      @records = case sort_option
                 when Proc   then  sort_option.call(@records)
                 when Hash   then  _sort_from_hash(sort_option)
                 when Symbol then  @records.send(sort_option)
                 else              @records.order(sort_option)
                 end
    end

    def _sort_from_hash(hash)
      sort_scope, sort_order = hash.first
      if @records.respond_to?(sort_scope)
        @records.send(sort_scope, sort_order)
      else
        @records.order(*sort_scope)
      end
    end

    def _sort_with_attribute
      attribute = _sort_method.include?('.') ? "#{table_name}.#{_sort_method}" : _sort_method

      order(attribute => sort_order)
    end

    def _sort_method
      @_sort_method ||= sort_param
    end

    def _sort_order
      return _default_sort_order if sort_params.blank?

      sort_params.start_with?('-') ? 'desc' : 'asc'
    end
  end
  # rubocop:enable Metrics/BlockLength
end
