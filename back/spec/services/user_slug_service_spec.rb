# frozen_string_literal: true

require 'rails_helper'

describe UserSlugService do
  let(:service) { described_class.new }

  describe '#generate_slugs' do
    it 'generates valid slugs for various user names' do
      first_names = ['将太', 'константин', '-']
      first_names.each do |first_name|
        user = build(:user, first_name: first_name, last_name: nil)
        expect(user).to be_valid
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
end
