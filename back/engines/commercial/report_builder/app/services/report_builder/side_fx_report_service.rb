# frozen_string_literal: true

module ReportBuilder
  class SideFxReportService < ::BaseSideFxService
    def before_create(report, user)
      layout_side_fx_service.before_create(report.layout, user)
    end

    def after_create(report, user)
      super(report, user)
      layout_side_fx_service.after_create(report.layout, user)
      ReportPublisher.new(report, user).publish
    end

    def before_update(report, user)
      layout_side_fx_service.before_update(report.layout, user) if report.layout.changed?
    end

    def after_update(report, user)
      super(report, user)
      layout_side_fx_service.after_update(report.layout, user) if report.layout.previous_changes.present?
    end

    def before_destroy(report, user)
      layout_side_fx_service.before_destroy(report.layout, user)
    end

    def after_destroy(frozen_report, user)
      super(frozen_report, user)
      layout_side_fx_service.after_destroy(frozen_report.layout, user)
    end

    private

    def resource_name
      :report
    end

    def layout_side_fx_service
      @layout_side_fx_service ||= ContentBuilder::SideFxLayoutService.new
    end
  end
end
