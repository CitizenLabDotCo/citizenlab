require 'rails_helper'

describe 'cl2back:shift_tenant_timestamps rake task' do
  before { load_rake_tasks_if_not_loaded }

  it 'Shifts timestamps by 1 day' do
    tenant = create(:tenant, settings: SettingsService.new.minimal_required_settings(locales: %w[en], lifecycle_stage: 'demo', country_code: 'BE'), creation_finalized_at: Time.now)
    tenant.switch do
      travel_to Time.zone.local(2200, 2, 8, 12, 0, 0) do
        user = create(:user, registration_completed_at: 2.days.ago)

        Rake::Task['cl2back:shift_tenant_timestamps'].invoke

        expect(user.reload.registration_completed_at.to_date).to eq 1.day.ago.to_date
      end
    end
  end
end
