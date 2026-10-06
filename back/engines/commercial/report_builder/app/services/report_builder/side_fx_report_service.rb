# frozen_string_literal: true

module ReportBuilder
  class SideFxReportService < ::BaseSideFxService
    def before_create(report, user)
      layout_side_fx_service.before_create(report.layout, user)
    end

    def after_create(report, user)
      super
      layout_side_fx_service.after_create(report.layout, user)
      ReportPublisher.new(report, user).publish
    end

    def before_update(report, user)
      layout_side_fx_service.before_update(report.layout, user) if report.layout.changed?
    end

    def after_update(report, user)
      super
      layout_side_fx_service.after_update(report.layout, user) if report.layout.previous_changes.present?
    end

    # The LLM finished writing the report. Distinct from a plain update: it is what
    # tells the admin who walked away that their report is ready.
    def after_generate(report, user)
      LogActivityJob.perform_later(report, 'generated', user, Time.now.to_i)
    end

    def before_destroy(report, user)
      layout_side_fx_service.before_destroy(report.layout, user)
    end

    def after_destroy(frozen_report, user)
      super
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
