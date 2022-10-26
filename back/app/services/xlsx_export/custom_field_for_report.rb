# frozen_string_literal: true

module XlsxExport
  class CustomFieldForReport
    delegate :key, :input_type, :accept, to: :custom_field

    def initialize(custom_field, scope = nil)
      @custom_field = custom_field
      @scope = scope
    end

    def column_header
      MultilocService.new.t(custom_field.title_multiloc)
    end

    def value_from(model)
      if scope
        model = model.public_send(scope)
        return unless model
      end
      visitor = ValueVisitor.new(model)
      visitor.visit self
    end

    private

    attr_reader :custom_field, :scope
  end
end
