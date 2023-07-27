# frozen_string_literal: true

class SideFxApiClientService
  include SideFxHelper

  def after_create(api_client, user)
    LogActivityJob.perform_later(api_client, 'created', user, api_client.created_at.to_i)
  end

  def after_destroy(frozen_api_client, user)
    serialized_api_client = clean_time_attributes(frozen_api_client.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_api_client), 'deleted', user, Time.now.to_i, payload: { api_client: serialized_api_client })
  end
end
