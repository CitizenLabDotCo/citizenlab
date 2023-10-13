# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:user) { create(:user) }

    describe 'when confirmation is turned off' do
      before { SettingsService.new.deactivate_feature! 'user_confirmation' }

      it 'raises an error' do
        expect { job.perform(user) }.to raise_error(RuntimeError)
      end
    end

    describe 'when confirmation is turned on' do
      before { SettingsService.new.activate_feature! 'user_confirmation' }

      it 'works' do
        job.perform(user)
      end
    end

    # it 'logs an activity with a GlobalID' do
    #   idea = create(:idea)
    #   user = create(:user)
    #   expect { job.perform(idea, 'created', user, Time.now) }.to change(Activity, :count).from(0).to(1)
    # end

    # it "logs a notification activity with the notification's subclass item_type" do
    #   notification = create(:comment_on_your_comment)
    #   user = create(:user)
    #   job.perform(notification, 'created', user, Time.now)
    #   expect(Activity.last.item_type).to eq notification.class.name
    # end
  end
end
