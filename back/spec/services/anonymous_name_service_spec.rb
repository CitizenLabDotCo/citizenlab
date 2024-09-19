# frozen_string_literal: true

require 'rails_helper'

describe AnonymousNameService do
  let(:service) { described_class.new(user) }
  let(:user) { create(:user, email: 'test@somewhere.com') }

  context 'when the scheme is "animal"' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['anonymous_name_scheme'] = 'animal'
      AppConfiguration.instance.update!(settings: settings)
    end

    describe '#first_name' do
      it 'returns a random colour' do
        expect(service.first_name).to eq 'Yellow'
      end

      it 'returns a random colour in French' do
        I18n.with_locale(:'fr-FR') do
          expect(service.first_name).to eq 'Jaune'
        end
      end
    end

    describe '#last_name' do
      it 'returns a random animal name' do
        expect(service.last_name).to eq 'Zebra'
      end

      it 'returns a random animal name in French' do
        I18n.with_locale(:'fr-FR') do
          expect(service.last_name).to eq 'Zèbre'
        end
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
end
