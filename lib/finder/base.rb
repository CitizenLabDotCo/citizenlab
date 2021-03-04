# frozen_string_literal: true

require 'callable'
require 'finder/error'
require 'finder/helpers'
require 'finder/inflectors'
require 'finder/sortable'

module Finder
  ## Finder::Base
  class Base
    include Callable
    include Finder::Helpers
    include Finder::Inflectors
    include Finder::Sortable

    ## You can now use #find instead of call.
    callable_with :find, error_class: Finder::Error, default_error: 'Something went wrong'

    def initialize(params, scope: nil, includes: [], current_user: nil)
      @params            = params.respond_to?(:permit!) ? params.permit! : params
      @current_user      = current_user
      @base_scope        = scope || _base_scope
      @records           = @base_scope.includes(includes)
    end

    protected

    attr_reader :params, :records, :current_user

    delegate :table_name, to: :_klass

    private

    def find
      do_find
      result.records = records
      result.count = records.length
    rescue ActiveRecord::StatementInvalid, PG::InFailedSqlTransaction, PG::UndefinedTable => e
      raise Finder::Error, e
    end

    def do_find
      _abort_if_records_class_invalid
      _filter_records
      _sort_records
      _paginate_records
    end

    def _abort_if_records_class_invalid
      return unless _klass.is_a?(ApplicationRecord)

      raise "#{_klass_string} is not a valid Model. Please rename your finder."
    end

    def _filter_records
      params.each do |param, value|
        send("#{param}_condition", value) if respond_to?("#{param}_condition", true)
      end
    end

    def _paginate_records
      pagination_params = params[:page] || {}
      filter_records { records.page(pagination_params[:number]).per(pagination_params[:size]) }
    end

    def _base_scope
      _klass.all
    end
  end
end
