class SideFxIdeaCustomFieldService
  include SideFxHelper

  def after_generate_geojson(custom_field, current_user)
    LogActivityJob.perform_later(
      custom_field,
      'generated_geojson_for_export',
      current_user,
      Time.zone.now.to_i
    )
  end
end
