namespace :mapping do
  desc 'Decrement map_configs zoom level by 1 if tenant uses MapTiler basemaps and map_config not using Esri map'
  task :fix_map_configs_zoom_level, [] => [:environment] do
    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Processing tenant: #{tenant.host}..."

      config = AppConfiguration.instance
      next unless config.settings.dig('maps', 'tile_provider')&.include?('maptiler')

      map_configs = CustomMaps::MapConfig.where(esri_base_map_id: nil, esri_web_map_id: nil).where.not(zoom_level: nil)

      map_configs.each do |map_config|
        old_v = map_config.zoom_level
        new_v = old_v >= 1.0 ? old_v - 1.0 : 0.0

        if map_config.update(zoom_level: new_v)
          reporter.add_change(
            old_v,
            new_v,
            context: { tenant: tenant.host, map_config: map_config.id }
          )
        else
          reporter.add_error(
            map_config.errors.details,
            context: { tenant: tenant.host, map_config: map_config.id }
          )
        end
      end
    end

    reporter.report!('fix_map_configs_zoom_level.json', verbose: true)
  end
end
