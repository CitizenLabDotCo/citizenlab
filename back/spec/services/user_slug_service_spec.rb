require 'rails_helper'

describe UserSlugService do
  let(:service) { UserSlugService.new }
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
        create(:user, slug: 'jose'),
      ]
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: nil)
      ]

      service.generate_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[jose-1]
    end
  end
end