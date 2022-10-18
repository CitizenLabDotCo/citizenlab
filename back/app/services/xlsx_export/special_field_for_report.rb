# frozen_string_literal: true

module XlsxExport
  class SpecialFieldForReport
    attr_reader :column_header

    def initialize(key, column_header, scope = nil)
      @key = key
      @column_header = column_header
      @scope = scope
    end

    def value_from(model)
      if scope
        model = model.public_send(scope)
        return unless model
      end
      model.public_send key
    end

    def accept(value_visitor)
      value_visitor.visit_special_field_for_report self
    end

    private

    attr_reader :key, :scope
  end
end
