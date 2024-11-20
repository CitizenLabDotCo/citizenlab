namespace :proposals_transition do
  desc 'Adds the prescreening status at the top of the ideation status set'
  task :add_prescreening_status_to_ideation, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      # Should be none, but just in case
      next if IdeaStatus.find_by(code: 'prescreening', participation_method: 'ideation')

      multiloc_service = MultilocService.new
      attributes = {
        title_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.prescreening', locales: CL2_SUPPORTED_LOCALES),
        code: 'prescreening',
        color: '#4B4B4B',
        description_multiloc: multiloc_service.i18n_to_multiloc('idea_statuses.prescreening_description', locales: CL2_SUPPORTED_LOCALES),
        participation_method: 'ideation'
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
