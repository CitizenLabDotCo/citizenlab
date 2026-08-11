# frozen_string_literal: true

require 'rails_helper'

describe 'cl2back:clean_tenant_settings rake task' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['cl2back:clean_tenant_settings'] }
  let(:removed_feature) { 'a_feature_no_longer_in_the_schema' }

  # The schema is additionalProperties: false, so an unknown feature can only be written by
  # bypassing validation -- the state a deploy that removes a feature leaves tenants in.
  def add_removed_feature(tenant)
    tenant.switch do
      config = AppConfiguration.instance
      config.update_columns(
        settings: config.settings.merge(removed_feature => { 'allowed' => true, 'enabled' => true })
      )
    end
  end

  def removed_feature?(tenant)
    tenant.switch { AppConfiguration.instance.settings.key?(removed_feature) }
  end

  it 'removes settings that are no longer in the schema' do
    tenant = create(:tenant, creation_finalized_at: Time.zone.now)
    add_removed_feature(tenant)

    task.execute

    expect(removed_feature?(tenant)).to be false
  end

  it 'skips deleted tenants' do
    tenant = create(:tenant, creation_finalized_at: Time.zone.now)
    add_removed_feature(tenant)
    tenant.update!(deleted_at: Time.zone.now)

    task.execute

    expect(removed_feature?(tenant)).to be true
  end
end
