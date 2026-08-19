# frozen_string_literal: true

require 'rails_helper'

describe UserSlugService do
  let(:service) { described_class.new }

  describe 'names carrying markup' do
    it 'builds a slug from the name with its markup stripped' do
      user = build(:user, first_name: '<b>Jose</b>', last_name: 'Moura')

      expect(service.generate_slug(user, user.full_name)).to eq 'jose-moura'
    end

    it 'keeps none of a payload in the slug' do
      user = build(:user, first_name: '<img src=x onerror=alert(1)>Jose', last_name: 'Moura')

      expect(service.generate_slug(user, user.full_name)).to eq 'jose-moura'
    end

    it 'strips markup when bulk generating slugs' do
      unpersisted_users = [build(:user, first_name: '<b>Jose</b>', last_name: 'Moura')]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[jose-moura]
    end

    it 'falls back to a uuid when the name is nothing but markup' do
      user = build(:user, first_name: '<b></b>', last_name: '<i></i>')

      expect(service.generate_slug(user, user.full_name)).to match(Sluggable::SLUG_REGEX)
    end

    it 'leaves an invitee whose name is nothing but markup without a slug' do
      unpersisted_users = [build(:user, invite_status: 'pending', first_name: '<b></b>', last_name: '<i></i>')]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq [nil]
    end

    it 'leaves both invitees without a slug when neither name survives stripping' do
      unpersisted_users = [
        build(:user, invite_status: 'pending', first_name: '<b></b>', last_name: '<i></i>'),
        build(:user, invite_status: 'pending', first_name: '<i></i>', last_name: '<b></b>')
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq [nil, nil]
    end
  end

  describe 'when Abbreviated User Names feature enabled' do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    it 'uses uuids when bulk generating slugs' do
      unpersisted_users = [build(:user, first_name: 'Jose', last_name: 'Moura')]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).not_to eq %w[jose-moura]
    end

    it 'uses uuid for slug' do
      unpersisted_record = build(:user, first_name: 'Jose', last_name: 'Moura')

      expect(service.generate_slug(unpersisted_record, unpersisted_record.full_name))
        .not_to eq 'jose-moura'
    end
  end
end
