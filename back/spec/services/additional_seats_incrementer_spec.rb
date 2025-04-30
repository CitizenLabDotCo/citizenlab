# frozen_string_literal: true

require 'rails_helper'

describe AdditionalSeatsIncrementer do
  before do
    config = AppConfiguration.instance
    config.settings['core']['maximum_admins_number'] = 1
    config.settings['core']['maximum_moderators_number'] = 1
    config.settings['core']['additional_admins_number'] = 0
    config.settings['core']['additional_moderators_number'] = 0
    config.save!

    ActiveJob::Base.queue_adapter.try(:enqueued_jobs=, [])
  end

  let(:current_user) { create(:user) }
  let(:updated_user) { create(:user) }

  describe '.increment_if_necessary' do
    it 'logs activity for admin', active_job_inline_adapter: true do
      allow(PublishActivityToRabbitJob).to receive(:perform_later).and_call_original

      create(:admin) # to reach limit
      new_role = { 'type' => 'admin' }
      updated_user.update!(roles: [new_role])

      expect { described_class.increment_if_necessary(updated_user, current_user) }
        .to change(Activity.where(action: 'additional_admins_number_incremented'), :count).from(0).to(1)

      activity = Activity.find_by(action: 'additional_admins_number_incremented')
      expect(activity.payload).to eq({ 'role' => new_role })
      expect(activity.item).to eq(updated_user)
      expect(activity.user).to eq(current_user)

      expect(PublishActivityToRabbitJob).to have_received(:perform_later).with(activity)
    end

    it 'logs activity for moderator', active_job_inline_adapter: true do
      allow(PublishActivityToRabbitJob).to receive(:perform_later).and_call_original

      create(:project_moderator) # to reach limit
      new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
      updated_user.update!(roles: [new_role])

      expect { described_class.increment_if_necessary(updated_user, current_user) }
        .to change(Activity.where(action: 'additional_moderators_number_incremented'), :count).from(0).to(1)

      activity = Activity.find_by(action: 'additional_moderators_number_incremented')
      expect(activity.payload).to eq({ 'role' => new_role })
      expect(activity.item).to eq(updated_user)
      expect(activity.user).to eq(current_user)

      expect(PublishActivityToRabbitJob).to have_received(:perform_later).with(activity)
    end

    it 'increments additional moderator seats' do
      create(:project_moderator) # to reach limit
      new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
      updated_user.update!(roles: [new_role])
      expect do
        described_class.increment_if_necessary(updated_user, nil)
      end.to not_change { AppConfiguration.instance.settings['core']['additional_admins_number'] }
        .and(change { AppConfiguration.instance.settings['core']['additional_moderators_number'] }.from(0).to(1))
        .and(have_enqueued_job(LogActivityJob).with(
          updated_user,
          'additional_moderators_number_incremented',
          nil,
          updated_user.updated_at.to_i,
          payload: { role: new_role }
        ))
    end

    it 'increments additional admin seats' do
      create(:admin) # to reach limit
      new_role = { 'type' => 'admin' }
      updated_user.update!(roles: [new_role])
      expect do
        described_class.increment_if_necessary(updated_user, nil)
      end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
        .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        .and(have_enqueued_job(LogActivityJob).with(
          updated_user,
          'additional_admins_number_incremented',
          nil,
          updated_user.updated_at.to_i,
          payload: { role: new_role }
        ))
    end

    # it can happen if both moderator and admin checkboxes are checked on the bulk invite page
    context 'when multiple roles are added to user' do
      it 'increments only admin seats when admin role goes first' do
        create(:admin) # to reach limit
        create(:project_moderator) # to reach limit
        admin_role = { 'type' => 'admin' }
        moder_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
        updated_user.update!(roles: [admin_role, moder_role])
        expect do
          described_class.increment_if_necessary(updated_user, nil)
        end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
          .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
          .and(have_enqueued_job(LogActivityJob).with(
            updated_user,
            'additional_admins_number_incremented',
            nil,
            updated_user.updated_at.to_i,
            payload: { role: { 'type' => 'admin' } }
          ))

        expect(LogActivityJob).not_to have_been_enqueued.with(
          anything,
          'additional_moderators_number_incremented',
          anything,
          anything,
          anything
        )
      end

      it 'increments only admin seats when admin role goes second' do
        create(:admin) # to reach limit
        create(:project_moderator) # to reach limit
        admin_role = { 'type' => 'admin' }
        moder_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
        updated_user.update!(roles: [moder_role, admin_role])
        expect do
          described_class.increment_if_necessary(updated_user, nil)
        end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
          .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
          .and(have_enqueued_job(LogActivityJob).with(
            updated_user,
            'additional_admins_number_incremented',
            nil,
            updated_user.updated_at.to_i,
            payload: { role: { 'type' => 'admin' } }
          ))

        expect(LogActivityJob).not_to have_been_enqueued.with(
          anything,
          'additional_moderators_number_incremented',
          anything,
          anything,
          anything
        )
      end
    end

    it 'increments additional seats beyond 1' do
      create(:admin) # to reach limit
      new_role = { 'type' => 'admin' }
      updated_user.update!(roles: [new_role])
      expect do
        described_class.increment_if_necessary(updated_user, nil)
      end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
        .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        .and(have_enqueued_job(LogActivityJob).with(
            updated_user,
            'additional_admins_number_incremented',
            nil,
            updated_user.updated_at.to_i,
            payload: { role: { 'type' => 'admin' } }
          ))

      updated_user = create(:user)
      updated_user.update!(roles: [new_role])
      expect do
        described_class.increment_if_necessary(updated_user, nil)
      end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(1).to(2)
        .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        .and(have_enqueued_job(LogActivityJob).with(
            updated_user,
            'additional_admins_number_incremented',
            nil,
            updated_user.updated_at.to_i,
            payload: { role: { 'type' => 'admin' } }
          ))
    end

    it 'does not increment additional seats if limit is not reached' do
      new_role = { 'type' => 'admin' }
      updated_user.update!(roles: [new_role])
      expect do
        described_class.increment_if_necessary(updated_user, nil)
      end.to not_change { AppConfiguration.instance.settings['core']['additional_admins_number'] }
        .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })

      expect(LogActivityJob).not_to have_been_enqueued.with(
        anything,
        'additional_admins_number_incremented',
        anything,
        anything,
        anything
      )
    end
  end
end
