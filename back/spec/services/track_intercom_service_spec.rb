# frozen_string_literal: true

require 'rails_helper'

describe TrackIntercomService do
  let(:intercom) { double(INTERCOM_CLIENT).as_null_object }
  let(:service) { described_class.new(intercom) }

  describe 'identify_user' do
    it "doesn't interact with Intercom when the given user is not an admin or moderator" do
      user = create(:user)
      super_admin = create(:super_admin)

      expect(intercom).not_to receive(:search)

      service.identify_user(user)
      service.identify_user(super_admin)
    end

    it "creates an Intercom contact if the contact didn't exist yet" do
      user = create(:admin)

      contacts_api = double
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      expect(contacts_api).to receive(:search)
        .and_return(OpenStruct.new({ count: 0 }))

      _contact = double.as_null_object
      expect(contacts_api).to receive(:create).with({
        role: 'user',
        external_id: user.id,
        email: user.email,
        name: user.full_name,
        signed_up_at: user.registration_completed_at,
        custom_attributes: hash_including(
          isAdmin: true,
          isSuperAdmin: false,
          isProjectModerator: false,
          highestRole: 'admin',
          firstName: user.first_name,
          lastName: user.last_name,
          locale: user.locale
        )
      }).and_return(_contact)

      service.identify_user(user)
    end

    it 'updates an Intercom contact if it already exist' do
      user = create(:admin)

      contacts_api = double
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      contact = double.as_null_object
      expect(contacts_api).to receive(:search)
        .and_return(double({ count: 1, :[] => contact }))

      expect(contact).to receive(:email=).with(user.email)
      expect(contact).to receive(:name=).with("#{user.first_name} #{user.last_name}")
      expect(contact).to receive(:signed_up_at=).with(user.registration_completed_at)
      expect(contact).to receive(:custom_attributes=).with(hash_including(
        isAdmin: true,
        isSuperAdmin: false,
        isProjectModerator: false,
        highestRole: 'admin',
        firstName: user.first_name,
        lastName: user.last_name,
        locale: user.locale
      ))

      expect(contacts_api).to receive(:save).with(contact).and_return(contact)

      service.identify_user(user)
    end
  end

  describe 'track_activity' do
    it "doesn't interact with Intercom when the given user is not an admin or moderator" do
      user = create(:user)
      super_admin = create(:super_admin)

      service.track_activity(build(:activity, user: user))
      service.track_activity(build(:activity, user: super_admin))
    end

    it 'sends the activity to Intercom' do
      admin = create(:admin)
      activity = build(:activity, user: admin)

      events_api = double
      expect(intercom).to receive(:events).and_return(events_api)

      expect(events_api).to receive(:create).with({
        event_name: "Idea published",
        created_at: activity.acted_at,
        user_id: admin.id,
        metadata: hash_including(
          source: 'cl2-back',
          item_id: activity.item_id,
          item_type: activity.item_type,
          action: 'published',
        )
      })

      service.track_activity(activity)
    end
  end
end
