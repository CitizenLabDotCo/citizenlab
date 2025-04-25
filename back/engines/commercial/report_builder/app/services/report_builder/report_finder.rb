# frozen_string_literal: true

module ReportBuilder
  class ReportFinder
    attr_reader :scope, :text_search, :owners, :service_reports, :community_monitor

    # @param scope [ReportBuilder::Report::ActiveRecord_Relation] The scope to filter. All
    #   reports by default.
    # @param text_search [String, nil] Filter the reports by their names.
    # @param owners [User::ActiveRecord_Relation, User, Enumerable<User>, nil] Filter
    #   the reports by their owners.
    # @param service_reports [Boolean, nil] If true, returns only reports from super
    #   admins. If false, returns only reports from non-super admins. If nil, this filter
    #   is ignored.
    # @param community_monitor [Boolean, nil] If true, returns only reports for the
    #   community monitor survey phase.
    def initialize(
      scope = ReportBuilder::Report.all,
      text_search: nil,
      owners: nil,
      service_reports: nil,
      community_monitor: nil
    )
      @scope = scope
      @text_search = text_search
      @owners = owners
      @service_reports = service_reports
      @community_monitor = community_monitor
    end

    def execute
      scope
        .then { filter_by_owners(_1) }
        .then { filter_service_reports(_1) }
        .then { filter_by_community_monitor(_1) }
        .then { search_name(_1) }
    end

    private

    def search_name(reports)
      text_search.blank? ? reports : reports.search_name(text_search)
    end

    def filter_by_owners(reports)
      owners.blank? ? reports : reports.where(owner: owners)
    end

    def filter_service_reports(reports)
      return reports if service_reports.nil?

      owners = service_reports ? User.super_admins : User.not_super_admins
      reports.where(owner: owners)
    end

    def filter_by_community_monitor(reports)
      return reports if community_monitor.blank?

      service = CommunityMonitorService.new
      return Report.none unless service.enabled? && service.phase

      reports.where(phase_id: service.phase.id)
    end
  end
end
