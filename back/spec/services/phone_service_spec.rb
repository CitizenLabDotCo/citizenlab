# frozen_string_literal: true

require 'rails_helper'

describe PhoneService do
  let(:service) { subject }

  describe '#phone_or_email' do
    it 'detects phone numbers' do
      expect(service.send(:phone_or_email, '1-208-809-2788 x6972')).to eq :phone
      expect(service.send(:phone_or_email, '0468 13 14 76')).to eq :phone
      expect(service.send(:phone_or_email, '+32.2.386.98.09')).to eq :phone
      expect(service.send(:phone_or_email, '025261212')).to eq :phone
      expect(service.send(:phone_or_email, '0032 (0) 3 241 11 32')).to eq :phone
    end

    it 'detects emails' do
      expect(service.send(:phone_or_email, 'test@test.com')).to eq :email
      expect(service.send(:phone_or_email, '42.343.4656.6@123.net')).to eq :email
      expect(service.send(:phone_or_email, '+12@test.net')).to eq :email
    end

    it 'returns nil when email nor phone number' do
      expect(service.send(:phone_or_email, '112')).to be_nil
      expect(service.send(:phone_or_email, '1234 text 34563')).to be_nil
      expect(service.send(:phone_or_email, '+123v44563')).to be_nil
      expect(service.send(:phone_or_email, 'somethinghere@')).to be_nil
    end

    it 'returns nil when email or phone number are blank' do
      expect(service.send(:phone_or_email, '')).to be_nil
      expect(service.send(:phone_or_email, nil)).to be_nil
    end
  end

  describe '#emailize_email_or_phone' do
    it 'returns phone number in email format' do
      configuration = AppConfiguration.instance
      configuration.settings['password_login'] = {
        'phone' => true,
        'allowed' => true,
        'enabled' => true,
        'enable_signup' => true,
        'minimum_length' => 8,
        'phone_email_pattern' => 'phone+__PHONE__@test.com'
      }
      configuration.save!

      expect(service.emailize_email_or_phone('+32.2.386.98.09')).to eq 'phone+3223869809@test.com'
    end

    it 'returns email' do
      expect(service.emailize_email_or_phone('test@test.com')).to eq 'test@test.com'
    end

    it 'returns nil when email or phone number are blank' do
      expect(service.emailize_email_or_phone('')).to eq ''
      expect(service.emailize_email_or_phone(nil)).to be_nil
    end
  end

  describe '#normalize_phone' do
    it 'only retains digits' do
      expect(service.send(:normalize_phone, '1-510-887-4548 x63521')).to eq '1510887454863521'
      expect(service.send(:normalize_phone, '+324.364-12-12-12')).to eq '324364121212'
    end
  end
end
