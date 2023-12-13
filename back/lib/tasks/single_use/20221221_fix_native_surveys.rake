# frozen_string_literal: true

namespace :single_use do
  desc 'Set the default posting limit for native surveys to max one per user'
  task fix_native_surveys: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant.switch do
        Project.where(participation_method: 'native_survey').update_all(
          posting_method: 'limited',
          posting_limited_max: 1
        )
        Phase.where(participation_method: 'native_survey').update_all(
          posting_method: 'limited',
          posting_limited_max: 1
        )
      end
    end
  end
end
