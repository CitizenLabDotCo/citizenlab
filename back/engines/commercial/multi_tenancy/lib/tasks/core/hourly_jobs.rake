# frozen_string_literal: true

namespace :cl2back do
  desc 'Execute recurrent behaviour such as automatic status changes or periodic notifications'
  task hourly: [:environment] do |_t, _args|
    now = Time.zone.now
    Tenant.creation_finalized.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        AutomatedTransitionJob.perform_later
        CreatePeriodicActivitiesJob.perform_later now.to_i
        CreateHeatmapGenerationJob.perform_later now.to_i
        DeleteInvitesJob.perform_later
        CleanupExpiredClaimTokensJob.perform_later
      end
    end
  end
end
