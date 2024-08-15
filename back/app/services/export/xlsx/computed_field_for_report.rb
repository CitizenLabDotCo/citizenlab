module Export
  module Xlsx
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
end
