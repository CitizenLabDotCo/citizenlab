# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass, RSpec/VerifiedDoubles, Style/OpenStructUse
describe 'single_use:backfill_intercom_user_attributes rake task' do
  let(:contacts_api) { double('contacts_api') }
  let(:intercom_client) { double('intercom_client', contacts: contacts_api).as_null_object }
  let(:task) { Rake::Task['single_use:backfill_intercom_user_attributes'] }

  before do
    load_rake_tasks_if_not_loaded
    stub_const('INTERCOM_CLIENT', intercom_client)
    SettingsService.new.activate_feature!('intercom')
    # The task sleeps between users for rate limiting; suppress in tests.
    allow_any_instance_of(Object).to receive(:sleep)
  end

  after { task.reenable }

  # Build a contact's current custom_attributes hash from what the service
  # would write — keeps the test in sync with TrackIntercomService.
  def populated_attrs_for(user)
    TrackIntercomService.new.user_attributes(user).transform_keys(&:to_s)
  end

  describe 'dry run' do
    it 'searches existing contacts but makes no writes' do
      create(:admin)
      contact = double('contact', custom_attributes: {}).as_null_object

      expect(contacts_api).to receive(:search).once.and_return(double(count: 1, :[] => contact))
      expect(contacts_api).not_to receive(:save)
      expect(contacts_api).not_to receive(:create)

      task.invoke
    end

    it 'reports a would-create when no Intercom contact exists' do
      create(:admin)

      expect(contacts_api).to receive(:search).once.and_return(OpenStruct.new(count: 0))
      expect(contacts_api).not_to receive(:create)

      task.invoke
    end
  end

  describe 'execute mode' do
    it 'updates an existing Intercom contact whose CDAs are missing' do
      user = create(:admin)
      contact = double('contact', custom_attributes: {}).as_null_object

      # search runs twice: once for the pre-check, once inside identify_user.
      expect(contacts_api).to receive(:search).twice.and_return(double(count: 1, :[] => contact))
      expect(contact).to receive(:custom_attributes=).with(hash_including(
        isAdmin: true,
        isSuperAdmin: false,
        isProjectModerator: false,
        isProjectFolderModerator: false,
        isSpaceModerator: false,
        highestRole: 'admin',
        firstName: user.first_name,
        lastName: user.last_name,
        locale: user.locale
      ))
      expect(contacts_api).to receive(:save).with(contact).and_return(contact)

      task.invoke('execute')
    end

    it 'skips contacts whose CDAs are already fully populated (no save, no second search)' do
      user = create(:admin)
      contact = double('contact', custom_attributes: populated_attrs_for(user))

      # Only the pre-check search runs; we skip identify_user entirely.
      expect(contacts_api).to receive(:search).once.and_return(double(count: 1, :[] => contact))
      expect(contacts_api).not_to receive(:save)
      expect(contacts_api).not_to receive(:create)

      task.invoke('execute')
    end

    it 'still updates when CDAs are partially populated (e.g. missing a new role flag)' do
      user = create(:admin)
      stale = populated_attrs_for(user)
      stale.delete('isProjectFolderModerator') # newly added CDA never set on this contact
      contact = double('contact', custom_attributes: stale).as_null_object

      expect(contacts_api).to receive(:search).twice.and_return(double(count: 1, :[] => contact))
      expect(contact).to receive(:custom_attributes=).with(hash_including(isProjectFolderModerator: false))
      expect(contacts_api).to receive(:save).with(contact).and_return(contact)

      task.invoke('execute')
    end

    it 'creates a new contact when none exists' do
      user = create(:admin)

      expect(contacts_api).to receive(:search).twice.and_return(OpenStruct.new(count: 0))
      expect(contacts_api).to receive(:create).with(hash_including(
        external_id: user.id,
        email: user.email,
        custom_attributes: hash_including(isAdmin: true, highestRole: 'admin')
      )).and_return(double.as_null_object)

      task.invoke('execute')
    end

    it 'skips super admins and regular users without searching Intercom' do
      create(:super_admin)
      create(:user)

      expect(contacts_api).not_to receive(:search)
      expect(contacts_api).not_to receive(:save)
      expect(contacts_api).not_to receive(:create)

      task.invoke('execute')
    end

    it 'processes folder moderators with the right role flags' do
      create(:project_folder_moderator)

      expect(contacts_api).to receive(:search).twice.and_return(OpenStruct.new(count: 0))
      expect(contacts_api).to receive(:create).with(hash_including(
        custom_attributes: hash_including(
          isAdmin: false,
          isProjectFolderModerator: true,
          isSpaceModerator: false,
          highestRole: 'project_folder_moderator'
        )
      )).and_return(double.as_null_object)

      task.invoke('execute')
    end

    it 'processes space moderators with the right role flags' do
      create(:space_moderator)

      expect(contacts_api).to receive(:search).twice.and_return(OpenStruct.new(count: 0))
      expect(contacts_api).to receive(:create).with(hash_including(
        custom_attributes: hash_including(
          isAdmin: false,
          isProjectFolderModerator: false,
          isSpaceModerator: true,
          highestRole: 'space_moderator'
        )
      )).and_return(double.as_null_object)

      task.invoke('execute')
    end

    it 'continues processing remaining users when one user errors' do
      failing_user = create(:admin)
      ok_contact = double('ok_contact', custom_attributes: {}).as_null_object

      allow(contacts_api).to receive(:search) do |query:|
        query_value = query[:value] || query['value']
        if query_value == failing_user.id
          raise StandardError, 'simulated Intercom failure'
        else
          double(count: 1, :[] => ok_contact)
        end
      end
      expect(contacts_api).to receive(:save).with(ok_contact).and_return(ok_contact)

      create(:admin) # ok user
      expect { task.invoke('execute') }.not_to raise_error
    end
  end

  describe 'tenant scoping' do
    it 'does nothing when intercom feature is not activated on the tenant' do
      SettingsService.new.deactivate_feature!('intercom')
      create(:admin)

      expect(contacts_api).not_to receive(:search)
      expect(contacts_api).not_to receive(:create)
      expect(contacts_api).not_to receive(:save)

      task.invoke('execute')
    end
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/VerifiedDoubles, Style/OpenStructUse
