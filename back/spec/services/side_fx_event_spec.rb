require "rails_helper"

describe SideFxEventService do
  let(:service) { SideFxEventService.new }
  let(:user) { create(:user) }
  let(:event) { create(:event) }

  describe "after_create" do
    it "logs a 'created' action when a event is created" do
      expect { service.after_create(event, user) }.to change{ Activity.where(action: 'created', user: user).count }.from(0).to(1)
    end

    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(event, :description_multiloc).and_return(event.description_multiloc)
      service.after_create(event, user)
    end
  end

  describe "before_update" do
    it "runs the description through the text image service" do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images).with(event, :description_multiloc).and_return(event.description_multiloc)
      service.before_update(event, user)
    end
  end

  describe "after_update" do
    it "logs a 'changed' action job when the event has changed" do
      event.update(title_multiloc: {'en': 'changed'})
      expect {service.after_update(event, user)}.
          to change{ Activity.where(action: 'changed', user: user).count }.from(0).to(1)
    end
  end

  describe "after_destroy" do
    it "logs a 'deleted' action job when the event is destroyed" do
      travel_to Time.now do
        frozen_event = event.destroy
        expect { service.after_destroy(frozen_event, user) }.
          to change{ Activity.where(action: 'deleted', user: user).count }.from(0).to(1)
      end
    end
  end

end
