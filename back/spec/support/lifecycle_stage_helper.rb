# frozen_string_literal: true

module LifecycleStageHelper
  # Sets the tenant's lifecycle stage for the current example. Writes with
  # update_column because AppConfiguration refuses normal saves that change the
  # stage from or to 'demo'.
  def change_lifecycle_stage(stage)
    config = AppConfiguration.instance
    config.settings['core']['lifecycle_stage'] = stage
    config.update_column(:settings, config.settings)
  end

  # The test-only id methods (bogus, fake_sso) are dropped on 'active' platforms, the
  # stage of the test tenant. This switches to the stage of the e2e platforms instead.
  def allow_test_id_methods
    change_lifecycle_stage('not_applicable')
  end
end
