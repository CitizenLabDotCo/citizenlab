namespace :single_use do
  desc 'Migrate contextual campaigns from the phase campaigns_settings'
  task :migrate_contextual_campaigns, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      global_campaign = EmailCampaigns::Campaigns::ProjectPhaseStarted.first
      next if !global_campaign&.enabled

      Phase.all.each do |phase|
        if phase.campaigns_settings&.key?('project_phase_started') && !phase.campaigns_settings['project_phase_started']
          EmailCampaigns::Campaigns::ProjectPhaseStarted.find_or_create_by(context: phase).update!(enabled: false)
          reporter.add_create(
            'EmailCampaigns::Campaigns::ProjectPhaseStarted',
            { enabled: false, context: phase },
            context: { tenant: tenant.host, phase: phase.id }
          )
        end
      end
    end
    reporter.report!('migrate_contextual_campaigns_report.json', verbose: true)
  end
end
