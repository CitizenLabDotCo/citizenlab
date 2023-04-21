# frozen_string_literal: true

require 'rails_helper'

describe SideFxEventService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:event) { create(:event) }

  describe 'after_create' do
    it "logs a 'created' action when a event is created" do
      expect { service.after_create(event, user) }
        .to enqueue_job(LogActivityJob)
        .with(event, 'created', user, event.created_at.to_i, project_id: event.project_id)
    end

    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(event, :description_multiloc).and_return(event.description_multiloc)
      service.after_create(event, user)
    end
  end

  describe 'before_update' do
    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(event, :description_multiloc).and_return(event.description_multiloc)
      service.before_update(event, user)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the event has changed" do
      event.update(title_multiloc: { en: 'changed' })
      expect { service.after_update(event, user) }
        .to enqueue_job(LogActivityJob)
        .with(event, 'changed', user, event.updated_at.to_i, project_id: event.project_id)
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the event is destroyed" do
      freeze_time do
        frozen_event = event.destroy
        expect { service.after_destroy(frozen_event, user) }
          .to enqueue_job(LogActivityJob)
      end
    end
  end
end
