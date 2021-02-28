# frozen_string_literal: true

require 'callable'
require 'finder/error'
require 'finder/sortable'
require 'finder/helpers'
require 'finder/inflectors'

module Finder
  ## Finder::Base
  class Base
    include Callable
    include Finder::Sortable
    include Finder::Helpers
    include Finder::Inflectors

    ## You can now use #find instead of call.
    callable_with :find, error_class: Finder::Error, default_error: 'Something went wrong'

    def initialize(params, scope: nil, includes: [], authorize_with: nil)
      @pagination_params = params[:page] || {}
      @sort_param        = params[:sort]
      @params            = params.respond_to?(:permit!) ? params.permit! : params
      @authorize_with    = authorize_with
      @base_scope        = scope || _base_scope
      @records           = @base_scope.includes(includes)
    end

    private

    def find
      do_find
      result.records = records
      result.count = records.count
    rescue ActiveRecord::StatementInvalid, PG::InFailedSqlTransaction, PG::UndefinedTable => e
      raise Finder::Error, e
    end

    def do_find
      _abort_if_records_class_invalid
      _authorize_records
      _filter_records
      _sort_records
      _paginate_records
    end

    def _abort_if_records_class_invalid
      return unless _klass.is_a?(ApplicationRecord)

      raise "#{_klass_string} is not a valid Model. Please rename your finder."
    end

    def _authorize_records
      return unless @authorize_with

      result.performed_authorization = true
      filter_records { ::Pundit.policy_scope(@authorize_with, records) }
    end

    def _filter_records
      params.each do |param, value|
        next unless respond_to?("#{param}_condition", true)

        send("#{param}_condition", value)
      end
    end

    def _paginate_records
      filter_records { records.page(pagination_params[:number]).per(pagination_params[:size]) }
    end

    def _base_scope
      _klass.all
    end

    protected

    attr_reader :params, :records, :pagination_params, :authorize_with
    attr_accessor :sort_param

    alias current_user authorize_with

    delegate :table_name, to: :_klass
  end
end
