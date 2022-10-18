# frozen_string_literal: true

module XlsxExport
  class ComputedFieldForReport
    attr_reader :column_header

    def initialize(key, column_header, proc)
      @key = key
      @column_header = column_header
      @proc = proc
    end

    def value_from(model)
      @proc.call(model)
    end
  end
end
