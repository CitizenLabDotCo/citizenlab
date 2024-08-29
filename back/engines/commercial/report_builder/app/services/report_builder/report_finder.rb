# frozen_string_literal: true

module ReportBuilder
  class ReportFinder
    attr_reader :scope, :text_search, :owners, :service_reports

    # @param scope [ReportBuilder::Report::ActiveRecord_Relation] The scope to filter. All
    #   reports by default.
    # @param text_search [String, nil] Filter the reports by their names.
    # @param owners [User::ActiveRecord_Relation, User, Enumerable<User>, nil] Filter
    #   the reports by their owners.
    # @param service_reports [Boolean, nil] If true, returns only reports from super
    #   admins. If false, returns only reports from non-super admins. If nil, this filter
    #   is ignored.
    def initialize(
      scope = ReportBuilder::Report.all,
      text_search: nil,
      owners: nil,
      service_reports: nil
    )
      @scope = scope
      @text_search = text_search
      @owners = owners
      @service_reports = service_reports
    end

    def execute
      scope
        .then { filter_by_owners(_1) }
        .then { filter_service_reports(_1) }
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
  end
end
