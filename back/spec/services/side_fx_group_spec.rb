# frozen_string_literal: true

require 'rails_helper'

describe SideFxGroupService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }
  let(:group) { create(:group) }

  describe 'after_update' do
    it "logs a 'changed' action job when the record has been updated" do
      travel_to(Time.now) do # rubocop:disable Rails/FreezeTime
        original_title = group.title_multiloc
        group.update(title_multiloc: { 'en' => 'Updated Title' })

        expect { service.after_update(group, current_user) }
          .to have_enqueued_job(LogActivityJob).with(
            [group.class.name, group.id].join('/'), # encode_frozen_resource(group),
            'changed',
            current_user,
            Time.now.to_i,
            payload: { changes: { 'title_multiloc' => [original_title, { 'en' => 'Updated Title' }] } }
          )
      end
    end

    it 'corrrectly logs update payload even when original record changed again before logging job runs' do
      travel_to(Time.now) do # rubocop:disable Rails/FreezeTime
        original_title = group.title_multiloc
        group.update(title_multiloc: { 'en' => 'Updated Title' })

        service.after_update(group, current_user)

        # group.update(title_multiloc: { 'en' => 'Updated Title again' })

        # This is probably happening after the job is executed, so does not really test what I want to test.
        group.destroy!

        expect(LogActivityJob).to(have_been_enqueued.at_least(:once).with.with(
          [group.class.name, group.id].join('/'), # encode_frozen_resource(group),
          'changed',
          current_user,
          Time.now.to_i,
          payload: { changes: { 'title_multiloc' => [original_title, { 'en' => 'Updated Title' }] } }
        ))
      end
    end
  end
end

def duplicate_group_object(group)
  group_copy = group.dup
  group_copy.id = group.id
  group_copy.created_at = group.created_at
  group_copy.updated_at = group.updated_at
  group_copy
end
