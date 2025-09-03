require 'rails_helper'

describe 'rake single_use:migrate_contextual_campaigns' do
  before { load_rake_tasks_if_not_loaded }

  it 'Migrates different global enabled and campaigns_settings configurations' do
    tenant_global_enabled = create(:tenant, creation_finalized_at: Time.now)
    tenant_global_enabled.switch do
      create(:project_phase_started_campaign, enabled: true)
      create(:phase, campaigns_settings: { 'project_phase_started' => true })
      create(:phase, campaigns_settings: { 'project_phase_started' => false })
      create(:phase, campaigns_settings: {})
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.count).to eq 1
    end
    tenant_global_disabled = create(:tenant, creation_finalized_at: Time.now)
    tenant_global_disabled.switch do
      create(:project_phase_started_campaign, enabled: false)
      create(:phase, campaigns_settings: { 'project_phase_started' => true })
      create(:phase, campaigns_settings: { 'project_phase_started' => false })
      create(:phase, campaigns_settings: {})
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.count).to eq 1
    end

    Rake::Task['single_use:migrate_contextual_campaigns'].invoke

    tenant_global_enabled.switch do
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.count).to eq 2
      enabled_phase = Phase.find_by(campaigns_settings: { 'project_phase_started' => true })
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.where(context: enabled_phase).count).to be 0
      disabled_phase = Phase.find_by(campaigns_settings: { 'project_phase_started' => false })
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.find_by(context: disabled_phase).enabled).to be false
      no_settings_phase = Phase.find_by(campaigns_settings: {})
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.where(context: no_settings_phase).count).to be 0
    end

    tenant_global_disabled.switch do
      expect(EmailCampaigns::Campaigns::ProjectPhaseStarted.count).to eq 1
    end
  end
end
