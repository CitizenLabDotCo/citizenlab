namespace :migrate_proposals do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :initiatives_to_proposals, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      project = create_proposals_project(tenant)
      map_initiatives_to_proposals = {}
      initiatives.each do |initiative|
        proposal_attributes = {
          title_multiloc: initiative.title_multiloc,
          project: project
        }
        proposal = Proposal.new proposal_attributes
        if proposal.save
          map_initiatives_to_proposals[initiative.id] = proposal.id
          reporter.add_create(
            'Proposal',
            proposal_attributes,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
        else
          reporter.add_error(
            proposal.errors.details,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
        end
      end
    end
    reporter.report!('migrate_initiatives_to_proposals.json', verbose: true)
  end
end
