require 'rails_helper'

describe 'mapping:fix_map_configs_zoom_level rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['mapping:fix_map_configs_zoom_level'].reenable }

  let!(:map_config1) { create(:map_config, zoom_level: 10.0) }
  let!(:map_config2) { create(:map_config, zoom_level: 1.0) }
  let!(:map_config3) { create(:map_config, zoom_level: nil) }
  let!(:map_config4) { create(:map_config, zoom_level: 0.5) }
  let!(:map_config5) { create(:map_config, zoom_level: 10.0, esri_web_map_id: '42') }
  let!(:map_config6) { create(:map_config, zoom_level: 10.0, esri_base_map_id: '42') }
  let!(:map_config7) { create(:map_config, zoom_level: 10.0, esri_web_map_id: '42', esri_base_map_id: '42') }

  context 'when the tenant uses MapTiler basemaps' do
    before do
      settings = AppConfiguration.instance.settings
      settings['maps']['tile_provider'] = 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=R0U21P01bsRLx7I7ZRqp'
      Current.app_configuration.update!(settings: settings)
    end

    it 'decrements the zoom level by 1 for map configs not using Esri maps' do
      Rake::Task['mapping:fix_map_configs_zoom_level'].invoke

      expect(map_config1.reload.zoom_level).to eq(9.0)
      expect(map_config2.reload.zoom_level).to eq(0.0)
    end

    it 'does not set zoom level if it is nil' do
      Rake::Task['mapping:fix_map_configs_zoom_level'].invoke

      expect(map_config3.reload.zoom_level).to be_nil
    end

    it 'does not attempt to set negative zoom level' do
      Rake::Task['mapping:fix_map_configs_zoom_level'].invoke

      expect(map_config4.reload.zoom_level).to eq(0.0)
    end

    it 'does not decrement zoom level if map_config has esri_web_map_id &/or esri_base_map_id set' do
      Rake::Task['mapping:fix_map_configs_zoom_level'].invoke

      expect(map_config5.reload.zoom_level).to eq(10.0)
      expect(map_config6.reload.zoom_level).to eq(10.0)
      expect(map_config7.reload.zoom_level).to eq(10.0)
    end
  end

  context 'when the tenant does NOT use MapTiler basemaps' do
    before do
      settings = AppConfiguration.instance.settings
      settings['maps']['tile_provider'] = 'https://api.notwhatwewant.com/maps'
      Current.app_configuration.update!(settings: settings)
    end

    it 'does not update any map_config zoom levels' do
      Rake::Task['mapping:fix_map_configs_zoom_level'].invoke

      expect(map_config1.reload.zoom_level).to eq(10.0)
      expect(map_config2.reload.zoom_level).to eq(1.0)
      expect(map_config3.reload.zoom_level).to be_nil
      expect(map_config4.reload.zoom_level).to eq(0.5)
      expect(map_config5.reload.zoom_level).to eq(10.0)
      expect(map_config6.reload.zoom_level).to eq(10.0)
      expect(map_config7.reload.zoom_level).to eq(10.0)
    end
  end
end
