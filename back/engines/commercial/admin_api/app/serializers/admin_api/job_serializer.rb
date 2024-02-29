# frozen_string_literal: true

module AdminApi
  class JobSerializer < ActiveModel::Serializer
    attributes :status, :last_error_message

    attribute(:id) { object.args['job_id'] }
    attribute(:class) { object.args['job_class'] }
    attribute(:run_at, key: :scheduled_at)

    attribute(:tenant) do
      schema_name = object.args['tenant_schema_name']
      next unless schema_name

      Tenant.schema_name_to_host(schema_name)
    end
  end
end
