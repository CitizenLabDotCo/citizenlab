require 'rails_helper'

describe UserSlugService do
  let(:service) { described_class.new }

  describe 'generate_slugs' do
    it 'generates unique slugs for unpersisted users with the same names' do
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura
        jose-moura-1
      ]
    end

    it 'generates unique slugs when one existing user already has the slug' do
      _persisted_user = create(:user, slug: 'jose-moura')
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura-1
        jose-moura-2
      ]
    end

    it 'generates unique slugs when existing users already have the slug' do
      _persisted_users = [
        create(:user, slug: 'jose-moura'),
        create(:user, slug: 'jose-moura-1'),
        create(:user, slug: 'paulo-silva-18')
      ]
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Paulo', last_name: 'Silva')
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura-2
        paulo-silva-19
      ]
    end

    it 'generates unique slugs when existing users already have only identical first names' do
      _persisted_users = [
        create(:user, slug: 'jose')
      ]
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: nil)
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[jose-1]
    end

    describe 'when Abbreviated User Names feature enabled' do
      before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

      it 'uses uuids for slugs' do
        unpersisted_users = [build(:user, first_name: 'Jose', last_name: 'Moura')]

        service.generate_slugs unpersisted_users

        expect(unpersisted_users.map(&:slug)).not_to eq %w[jose-moura]
      end
    end
  end

  describe 'generate_slug' do
    it 'generates a unique slug when an existing record already has the slug' do
      _persisted_record = create(:user, first_name: 'Jose', last_name: 'Moura')
      unpersisted_record = build(:user, first_name: 'Jose', last_name: 'Moura')

      expect(service.generate_slug(unpersisted_record, unpersisted_record.full_name))
        .to eq 'jose-moura-1'
    end

    describe 'when Abbreviated User Names feature enabled' do
      before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

      it 'uses uuid for slug' do
        unpersisted_record = build(:user, first_name: 'Jose', last_name: 'Moura')

        expect(service.generate_slug(unpersisted_record, unpersisted_record.full_name))
          .not_to eq 'jose-moura'
      end
    end
  end
end
