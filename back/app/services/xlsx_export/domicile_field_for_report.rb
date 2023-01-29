# frozen_string_literal: true

module XlsxExport
  class DomicileFieldForReport < CustomFieldForReport
    private

    def option_index
      @option_index ||= Area.all.index_by(&:id)
    end
  end
end
