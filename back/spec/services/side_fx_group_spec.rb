# frozen_string_literal: true

require 'rails_helper'

describe SideFxGroupService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }
  let(:group) { create(:group) }

  describe 'after_update' do
    it "logs a 'changed' action job when the record has been updated" do
      group.update(title_multiloc: { 'en' => 'Updated Title' })
      # group.destroy!
      expect { service.after_update(group, current_user) }
        .to have_enqueued_job(LogActivityJob).with(
          group,
          'changed',
          current_user,
          group.updated_at.to_i,
          payload: { changes: group.previous_changes }
        )
    end
  end
end
