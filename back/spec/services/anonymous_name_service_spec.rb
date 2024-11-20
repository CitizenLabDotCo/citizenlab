# frozen_string_literal: true

require 'rails_helper'

describe AnonymousNameService do
  let(:service) { described_class.new(user) }
  let(:user) { create(:user, email: 'test@somewhere.com', created_at: '2024-09-30 12:00:00') }

  context 'when the scheme is "animal"' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['anonymous_name_scheme'] = 'animal'
      AppConfiguration.instance.update!(settings: settings)
    end

    describe '#first_name' do
      it 'returns a random (but consistent) animal name' do
        expect(service.first_name).to eq 'Aardvark'
      end

      it 'returns a random animal in French' do
        user.update!(locale: 'fr-FR')
        expect(service.first_name).to eq 'Oryctérope'
      end
    end

    describe '#last_name' do
      it 'returns a random (but consistent) animal name' do
        expect(service.last_name).to eq 'Zebra'
      end

      it 'returns a random animal name in French' do
        user.update!(locale: 'fr-FR')
        expect(service.last_name).to eq 'Zèbre'
      end
    end
  end

  context 'when the scheme is "user"' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['anonymous_name_scheme'] = 'user'
      AppConfiguration.instance.update!(settings: settings)
    end

    describe '#first_name' do
      it 'returns "user"' do
        expect(service.first_name).to eq 'User'
      end
    end

    describe '#last_name' do
      it 'returns a 6 digit number' do
        expect(service.last_name).to eq '342990'
      end
    end
  end

  context 'when the scheme is NOT set in settings' do
    describe '#first_name' do
      it 'returns "user"' do
        expect(service.first_name).to eq 'User'
      end
    end

    describe '#last_name' do
      it 'returns a 6 digit number' do
        expect(service.last_name).to eq '342990'
      end
    end
  end
end
