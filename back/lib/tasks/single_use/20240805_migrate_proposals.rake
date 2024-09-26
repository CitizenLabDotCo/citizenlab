namespace :initiatives_to_proposals do
  desc 'Add the default proposals statuses and reorder all statuses.'
  task :add_proposals_statuses, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      rake_20240805_proposals_statuses_attrs.each do |status_attrs|
        next if IdeaStatus.find_by(code: status_attrs[:code], participation_method: status_attrs[:participation_method])

        status = IdeaStatus.new(status_attrs)
        if status.save
          reporter.add_create(
            'IdeaStatus',
            status_attrs,
            context: { tenant: tenant.host }
          )
        else
          reporter.add_error(
            status.errors.details,
            context: { tenant: tenant.host, status: status.code }
          )
        end
      end
      IdeaStatus.all.reverse_each(&:move_to_top)
    end
    reporter.report!('add_proposals_statuses_report.json', verbose: true)
  end
end

def rake_20240805_proposals_statuses_attrs
  multiloc_service = MultilocService.new
  [
    {
      title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.proposed', locales: CL2_SUPPORTED_LOCALES),
      ordering: 0,
      code: 'proposed',
      color: '#BEE7EB',
      description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.proposed_description', locales: CL2_SUPPORTED_LOCALES),
      participation_method: 'proposals'
    },
    {
      title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.threshold_reached', locales: CL2_SUPPORTED_LOCALES),
      ordering: 1,
      code: 'threshold_reached',
      color: '#40B8C5',
      description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.threshold_reached_description', locales: CL2_SUPPORTED_LOCALES),
      participation_method: 'proposals'
    },
    {
      title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.expired', locales: CL2_SUPPORTED_LOCALES),
      ordering: 2,
      code: 'expired',
      color: '#FF672F',
      description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.expired_description', locales: CL2_SUPPORTED_LOCALES),
      participation_method: 'proposals'
    },
    {
      title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.answered', locales: CL2_SUPPORTED_LOCALES),
      ordering: 3,
      code: 'answered',
      color: '#147985',
      description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.answered_description', locales: CL2_SUPPORTED_LOCALES),
      participation_method: 'proposals'
    },
    {
      title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.ineligible', locales: CL2_SUPPORTED_LOCALES),
      ordering: 4,
      code: 'ineligible',
      color: '#E52516',
      description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.ineligible_description', locales: CL2_SUPPORTED_LOCALES),
      participation_method: 'proposals'
    }
  ]
end
