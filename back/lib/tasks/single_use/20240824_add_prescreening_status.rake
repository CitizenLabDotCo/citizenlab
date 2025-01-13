namespace :proposals_transition do
  desc 'Adds the prescreening status at the top of the proposals status set'
  task :add_prescreening_status, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      next if IdeaStatus.find_by(code: 'prescreening', participation_method: 'proposals')

      multiloc_service = MultilocService.new
      attributes = {
        title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.prescreening', locales: CL2_SUPPORTED_LOCALES),
        code: 'prescreening',
        color: '#767676',
        description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.prescreening_description', locales: CL2_SUPPORTED_LOCALES),
        participation_method: 'proposals'
      }
      status = IdeaStatus.new attributes
      if status.save
        status.move_to_top
        reporter.add_create(
          'IdeaStatus',
          attributes,
          context: { tenant: tenant.host }
        )
      else
        reporter.add_error(
          status.errors.details,
          context: { tenant: tenant.host }
        )
      end
    end
    reporter.report!('add_prescreening_report.json', verbose: true)
  end
end
