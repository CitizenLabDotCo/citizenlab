# frozen_string_literal: true

module Export
  # A report column defined by a header and a value proc. Format-agnostic and
  # shared by the xlsx and pdf exports (alongside CustomFieldForExport), so it
  # lives in the top-level Export namespace rather than under Export::Xlsx.
  # `key` is the stable identifier used for field-level redaction; fields
  # derived from a question (e.g. matrix statements) leave it nil and are
  # redacted through their parent field instead.
  class ComputedFieldForReport
    attr_reader :key, :column_header

    def initialize(column_header, proc, key: nil, hyperlink: false)
      @key = key
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
