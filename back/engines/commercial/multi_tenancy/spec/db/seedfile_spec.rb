# frozen_string_literal: true

require 'rails_helper'

describe 'db/seeds.rb' do
  # TODO: Refacor this to have separate examples for various assertions. Didn't
  # seem to work the straightforward way after multiple runs, seems to be due to
  # the schema created by apartment for the seedfile tenant. It's not getting
  # deleted after the tests
  it 'generates a localhost tenant with a couple of records' do
    expect(Tenant.count).to be(1)

    load Rails.root.join('db/seeds.rb')

    expect(Tenant.count).to be(2)

    Apartment::Tenant.switch('localhost') do
      load Rails.root.join('db/seeds.rb')
      # The default tenant has a locked id to make it easier for other related
      # projects to have seed data that works out of the box with cl2-back
      expect(Tenant.current.id).to eq 'c72c5211-8e03-470b-9564-04ec0a8c322b'
      expect(User.count).to be > 0
      expect(User.find_by(email: 'admin@citizenlab.co').id).to eq '386d255e-2ff1-4192-8e50-b3022576be50'
      expect(User.find_by(email: 'moderator@citizenlab.co').id).to eq '61caabce-f7e5-4804-b9df-36d7d7d73e4d'
      expect(User.find_by(email: 'user@citizenlab.co').id).to eq '546335a3-33b9-471c-a18a-d5b58ebf173a'
      expect(Topic.count).to be > 0
      expect(Area.count).to be > 0
      expect(Project.count).to be > 0
      expect(Event.count).to be >= 4
      expect(Idea.count).to be > 0
      expect(IdeaImage.count).to be > 0
      expect(ProjectImage.count).to be > 0
      expect(Comment.count).to be > 0
      expect(NavBarItem.count).to be > 0
      expect(StaticPage.count).to be > 3
      expect(IdeaStatus.count).to be > 0
      expect(Group.count).to be > 0
      expect(CustomField.with_resource_type('User').count).to be > 0
      expect(CustomFieldOption.count).to be > 0
      # expect(CustomField.with_resource_type('CustomForm').count).to be > 0
      expect(Invite.count).to be > 0
      # expect(IdIdCardLookup::IdCard.count).to be 10
      expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
      expect(CustomMaps::MapConfig.count).to be 1
      expect(CustomMaps::Layer.count).to be 2
      expect(CustomMaps::LegendItem.count).to be 7
      expect(Volunteering::Cause.count).to be 5
      expect(Volunteering::Volunteer.count).to be > 10
      expect(Analytics::DimensionDate.count).to be > 0
      expect(Analytics::DimensionLocale.count).to be > 0
      expect(Analytics::DimensionType.count).to be > 0
      expect(Analytics::DimensionReferrerType.count).to be > 0
      expect(Analytics::FactVisit.count).to be 3
    end
  end

  it 'generates an empty_localhost tenant with a few records' do
    stub_const('ENV', ENV.to_hash.merge('SEED_EMPTY_TENANT' => 'TRUE'))
    load Rails.root.join('db/seeds.rb')

    Apartment::Tenant.switch('empty_localhost') do
      load Rails.root.join('db/seeds.rb')
      expect(Tenant.current.id).to eq '07ff8088-cc78-4307-9a1c-ebb6fb836f96'
      expect(User.count).to be 1
      expect(User.find_by(email: 'admin@citizenlab.co').id).to eq 'e0d698fc-5969-439f-9fe6-e74fe82b567a'
      expect(Topic.count).to be > 0
      expect(IdeaStatus.count).to be > 0
      expect(Area.count).to be 0
      expect(Project.count).to be 1
      expect(Phase.count).to be 0
      expect(Event.count).to be 4
      expect(Idea.count).to be 0
      expect(Comment.count).to be 0
      expect(Group.count).to be 0
    end
  end
end
