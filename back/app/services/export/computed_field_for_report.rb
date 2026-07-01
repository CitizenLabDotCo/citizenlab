# frozen_string_literal: true

module Export
  # A report column defined by a header and a value proc. Format-agnostic and
  # shared by the xlsx and pdf exports (alongside CustomFieldForExport), so it
  # lives in the top-level Export namespace rather than under Export::Xlsx.
  class ComputedFieldForReport
    attr_reader :column_header

    def initialize(column_header, proc, hyperlink: false)
      @column_header = column_header
      @proc = proc
      @hyperlink = hyperlink
    end

    def value_from(model)
      @proc.call(model)
    end

    def hyperlink?
      !!@hyperlink
    end
  end
end
