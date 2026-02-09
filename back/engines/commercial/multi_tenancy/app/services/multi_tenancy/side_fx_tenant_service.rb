# frozen_string_literal: true

module MultiTenancy
  class SideFxTenantService
    include SideFxHelper

    def before_create(tenant, current_user = nil) end

    def after_create(tenant, current_user = nil)
      LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
    end

    def before_apply_template(tenant, _template, current_user = nil)
      LogActivityJob.perform_later(tenant, 'loading_template', current_user, Time.now.to_i)
    end

    def around_apply_template(tenant, _template, current_user = nil)
      yield
    rescue StandardError => e
      LogActivityJob.perform_later(tenant, 'creation_failed', current_user, Time.now.to_i, payload: {
        error_message: "Loading of the template failed.\n#{e}"
      })
      raise e
    end

    def after_apply_template(tenant, template, current_user = nil)
      LogActivityJob.perform_later(tenant, 'template_loaded', current_user, Time.now.to_i, payload: {
        tenant_template: template
      })

      tenant.switch do
        TenantService.new.finalize_creation tenant
        LogActivityJob.perform_later tenant, 'creation_finalized', current_user, tenant.creation_finalized_at.to_i
      rescue StandardError => e
        LogActivityJob.perform_later(tenant, 'creation_failed', current_user, Time.now.to_i, payload: {
          error_message: 'Finalization of tenant (default campaigns, permissions, tracking) failed'
        })
        raise e
      end
    ensure
      # This check is necessary because loading a data template with users can cause the
      # concurrent deletion of a tenant to fail. The reason is that before deleting a
      # tenant, the deletion process removes all users and their PII individually. Once
      # all users have been removed, the tenant can be safely deleted. However, loading
      # a data template can potentially add new users and prevent the tenant from being
      # deleted. Since there are no ways to interrupt the loading process, we wait until
      # it's finished, and then try to delete the tenant again if necessary.
      ::MultiTenancy::Tenants::DeleteJob.perform_later(tenant) if tenant.reload.deleted?
    end

    def before_update(tenant, current_user = nil) end

    def after_update(tenant, current_user = nil)
      LogActivityJob.perform_later(tenant, 'changed', current_user, tenant.updated_at.to_i)

      trigger_host_changed_effects(tenant, current_user) if tenant.host_previously_changed?
      tenant.switch { TrackTenantJob.perform_later tenant }
    end

    def before_destroy(tenant, _current_user = nil)
      tenant.switch { Surveys::TypeformWebhookManager.new.delete_all_webhooks }
    end

    def after_destroy(frozen_tenant, current_user = nil)
      serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i,
        payload: { tenant: serialized_tenant })
    end

    private

    def trigger_host_changed_effects(tenant, user)
      LogActivityJob.perform_later(tenant, 'changed_host', user, tenant.updated_at.to_i,
        payload: { changes: tenant.host_previous_change })
    end
  end
end
