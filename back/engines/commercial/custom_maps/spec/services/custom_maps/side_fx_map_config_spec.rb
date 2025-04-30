# frozen_string_literal: true

require 'rails_helper'

describe CustomMaps::SideFxMapConfigService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:map_config) { create(:map_config) }

  describe 'after_create' do
    it "logs a 'created' action when a map_config is created" do
      expect { service.after_create(map_config, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(map_config, 'created', user, map_config.created_at.to_i, project_id: map_config.project_id)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the map_config has changed" do
      map_config.update(zoom_level: 10)
      expect { service.after_update(map_config, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(map_config, 'changed', user, map_config.updated_at.to_i, project_id: map_config.project_id)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the map_config is destroyed" do
      freeze_time do
        frozen_map_config = map_config.destroy
        expect { service.after_destroy(frozen_map_config, user) }
          .to have_enqueued_job(LogActivityJob).with(
            "CustomMaps::MapConfig/#{frozen_map_config.id}",
            'deleted',
            user,
            anything,
            anything
          )
      end
    end
  end
end
