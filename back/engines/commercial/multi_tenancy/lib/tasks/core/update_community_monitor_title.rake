# frozen_string_literal: true

# Community Monitor Title is not editable in the application
# This task can be used to update the title if and when a translation of community monitor changes
namespace :fix_existing_tenants do
  desc 'Update community monitor title to the latest translations'
  task update_community_monitor_title: [:environment] do |_t, _args|
    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Processing tenant: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        project = Project.find_by(internal_role: 'community_monitor', hidden: true)
        next unless project

        new_title_multiloc = MultilocService.new.i18n_to_multiloc('phases.community_monitor_title')
        project.update!(title_multiloc: new_title_multiloc)
        project.phases.first.update!(
          title_multiloc: new_title_multiloc,
          native_survey_title_multiloc: new_title_multiloc
        )
        Rails.logger.info 'UPDATED community monitor title'
      end
    end
  end
end
