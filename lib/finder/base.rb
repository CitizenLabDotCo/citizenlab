# frozen_string_literal: true

require 'callable'
require 'finder/error'
require 'finder/sortable'
require 'finder/helpers'

module Finder
  ## Finder::Base
  class Base
    include Callable
    include Finder::Sortable
    include Finder::Helpers

    ## You can now use #find instead of call.
    callable_with :find, error_class: Finder::Error, default_error: 'Something went wrong'

    def initialize(params, scope: nil, includes: [], authorize_with: nil)
      @pagination_params = params.dig(:page) || {}
      @sort_param        = params.dig(:sort)
      @params            = params.is_a? ActionController::UnfilteredParameters ? params.permit! : params
      @authorize_with    = authorize_with
      @base_scope        = scope || _base_scope
      @records           = @base_scope.includes(includes)
    end

    private

    def find
      _raise_error_if_records_class_invalid
      _authorize_records
      _filter_records
      _sort_records
      _paginate_records
      result.records = records
      result.count = records.count
    rescue ActiveRecord::StatementInvalid, PG::InFailedSqlTransaction, PG::UndefinedTable => e
      raise Finder::Error, e
    end

    def _raise_error_if_records_class_invalid
      return unless _klass&.is_a?(ApplicationRecord)

      raise "#{_klass_string} is not a valid Model. Please rename your finder."
    end

    def _authorize_records
      return unless @authorize_with

      result.performed_authorization = true
      filter_records { ::Pundit.policy_scope(@authorize_with, records) }
    end

    def _filter_records
      params.each do |param, value|
        value = [nil] if value == []
        next unless respond_to?("#{param}_condition", true) && value.present?

        send("#{param}_condition", value)
      end
      records
    end

    def _paginate_records
      filter_records { records.page(pagination_params.dig(:number)).per(pagination_params.dig(:size)) }
    end

    def _klass
      return @_klass if @_klass || !Object.const_defined?(_klass_string)

      @_klass = _klass_string.constantize
    end

    def _klass_string
      @_klass_string ||= self.class.name.gsub('Finder', '').singularize
    end

    def _base_scope
      _klass.all
    end

    protected

    attr_reader :params, :records, :pagination_params
    attr_accessor :sort_param

    delegate :table_name, to: :_klass
  end
end
