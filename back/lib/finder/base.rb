# frozen_string_literal: true

require 'finder/error'
require 'finder/helpers'
require 'finder/inflectors'

module Finder
  class Base
    include Finder::Helpers
    include Finder::Inflectors

    def initialize(params, scope: nil, includes: [], current_user: nil)
      @params            = params.respond_to?(:permit!) ? params.permit! : params
      @current_user      = current_user
      @base_scope        = scope || _base_scope
      @records           = @base_scope.includes(includes)
      @includes          = includes
    end

    def find_records
      find
      records
    end

    protected

    attr_reader :params, :records, :current_user

    delegate :table_name, to: :_klass

    private

    def find
      _abort_if_records_class_invalid
      _filter_records
    rescue ActiveRecord::StatementInvalid, PG::InFailedSqlTransaction, PG::UndefinedTable => e
      raise Finder::Error, e
    end

    def _abort_if_records_class_invalid
      return unless _klass.is_a?(ApplicationRecord)

      raise "#{_klass_string} is not a valid Model. Please rename your finder."
    end

    def _filter_records
      params.each do |param, value|
        next unless respond_to?("#{param}_condition", true)

        new_records = send("#{param}_condition", value)

        @records = new_records if new_records
      end
    end

    def _base_scope
      _klass.all
    end
  end
end
