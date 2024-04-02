# frozen_string_literal: true

require 'rails_helper'

describe CustomMaps::SideFxMapConfigService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:layer) { create(:layer) }

  describe 'after_create' do
    it "logs a 'created' action when a layer is created" do
      expect { service.after_create(layer, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(layer, 'created', user, layer.created_at.to_i)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the layer has changed" do
      layer.update(layer_url: 'https:://example_layer_url.com')
      expect { service.after_update(layer, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(layer, 'changed', user, layer.updated_at.to_i)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the layer is destroyed" do
      freeze_time do
        frozen_layer = layer.destroy
        expect { service.after_destroy(frozen_layer, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end
  end
end
