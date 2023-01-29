# frozen_string_literal: true

require 'rails_helper'

describe IdViennaSaml::CitizenSamlOmniauth do
  describe '#profile_to_user_attrs' do
    subject(:user_attrs) { described_class.new.profile_to_user_attrs(profile) }

    context 'when the name is included in the SAML response' do
      let(:profile) do
        OmniAuth::AuthHash.new(
          {
            'provider' => 'vienna_citizen',
            'uid' => '_254e789de8e21e632c8ca2c71aacc980',
            'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
            'credentials' => {},
            'extra' =>
            { 'raw_info' =>
             { 'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
               'http://lfrz.at/stdportal/names/pvp2/txid' => ['101840$tkhx@7009p1'],
               'urn:oid:2.5.4.11' => ['MA 01'],
               'urn:oid:1.2.40.0.10.2.1.1.261.20' => ['Preß'],
               'urn:oid:0.9.2342.19200300.100.1.3' => ['philipp.press@extern.wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.10' => ['2.1'],
               'urn:oid:1.2.40.0.10.2.1.1.153' => ['L9-M01'],
               'urn:oid:0.9.2342.19200300.100.1.1' => ['wien1.prp9002@wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.30' => ['access()'],
               'urn:oid:1.2.40.0.10.2.1.1.261.24' => ['L9'],
               'urn:oid:1.2.40.0.10.2.1.1.261.110' => ['1'],
               'urn:oid:2.5.4.42' => ['Philipp'],
               'urn:oid:1.2.40.0.10.2.1.1.3' => ['AT:VKZ:L9-M01'],
               'urn:oid:1.2.40.0.10.2.1.1.1' => ['AT:L9:1:magwien.gv.at/prp9002'],
               'http://lfrz.at/stdportal/names/pvp/gvoudomain' => ['magwien.gv.at'],
               'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14' },
              'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
              'response_object' => OneLogin::RubySaml::Response.new('fakeresponse') }
          }
        )
      end

      it 'returns user attrs from profile response' do
        expect(user_attrs).to include(
          email: 'philipp.press@extern.wien.gv.at',
          first_name: 'Philipp',
          last_name: 'Preß',
          locale: 'en'
        )
      end
    end

    context 'when the name is mising in the SAML response' do
      let(:profile) do
        OmniAuth::AuthHash.new(
          {
            'provider' => 'vienna_citizen',
            'uid' => '_254e789de8e21e632c8ca2c71aacc980',
            'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
            'credentials' => {},
            'extra' =>
            { 'raw_info' =>
             { 'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
               'http://lfrz.at/stdportal/names/pvp2/txid' => ['101840$tkhx@7009p1'],
               'urn:oid:2.5.4.11' => ['MA 01'],
               'urn:oid:0.9.2342.19200300.100.1.3' => ['philipp.press@extern.wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.10' => ['2.1'],
               'urn:oid:1.2.40.0.10.2.1.1.153' => ['L9-M01'],
               'urn:oid:0.9.2342.19200300.100.1.1' => ['wien1.prp9002@wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.30' => ['access()'],
               'urn:oid:1.2.40.0.10.2.1.1.261.24' => ['L9'],
               'urn:oid:1.2.40.0.10.2.1.1.261.110' => ['1'],
               'urn:oid:1.2.40.0.10.2.1.1.3' => ['AT:VKZ:L9-M01'],
               'urn:oid:1.2.40.0.10.2.1.1.1' => ['AT:L9:1:magwien.gv.at/prp9002'],
               'http://lfrz.at/stdportal/names/pvp/gvoudomain' => ['magwien.gv.at'],
               'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14' },
              'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
              'response_object' => OneLogin::RubySaml::Response.new('fakeresponse') }
          }
        )
      end

      it 'returns placeholder' do
        expect(user_attrs).to include(
          email: 'philipp.press@extern.wien.gv.at',
          first_name: 'P',
          last_name: 'P',
          locale: 'en'
        )
      end
    end

    context 'when the name is mising and the email local part is a single word' do
      let(:profile) do
        OmniAuth::AuthHash.new(
          {
            'provider' => 'vienna_citizen',
            'uid' => '_254e789de8e21e632c8ca2c71aacc980',
            'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
            'credentials' => {},
            'extra' =>
            { 'raw_info' =>
             { 'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
               'http://lfrz.at/stdportal/names/pvp2/txid' => ['101840$tkhx@7009p1'],
               'urn:oid:2.5.4.11' => ['MA 01'],
               'urn:oid:0.9.2342.19200300.100.1.3' => ['philipp@extern.wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.10' => ['2.1'],
               'urn:oid:1.2.40.0.10.2.1.1.153' => ['L9-M01'],
               'urn:oid:0.9.2342.19200300.100.1.1' => ['wien1.prp9002@wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.30' => ['access()'],
               'urn:oid:1.2.40.0.10.2.1.1.261.24' => ['L9'],
               'urn:oid:1.2.40.0.10.2.1.1.261.110' => ['1'],
               'urn:oid:1.2.40.0.10.2.1.1.3' => ['AT:VKZ:L9-M01'],
               'urn:oid:1.2.40.0.10.2.1.1.1' => ['AT:L9:1:magwien.gv.at/prp9002'],
               'http://lfrz.at/stdportal/names/pvp/gvoudomain' => ['magwien.gv.at'],
               'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14' },
              'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
              'response_object' => OneLogin::RubySaml::Response.new('fakeresponse') }
          }
        )
      end

      it 'returns placeholder' do
        expect(user_attrs).to include(
          email: 'philipp@extern.wien.gv.at',
          first_name: 'P',
          last_name: 'H',
          locale: 'en'
        )
      end
    end

    context 'when the name is mising and the email local part is a single character' do
      let(:profile) do
        OmniAuth::AuthHash.new(
          {
            'provider' => 'vienna_citizen',
            'uid' => '_254e789de8e21e632c8ca2c71aacc980',
            'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
            'credentials' => {},
            'extra' =>
            { 'raw_info' =>
             { 'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
               'http://lfrz.at/stdportal/names/pvp2/txid' => ['101840$tkhx@7009p1'],
               'urn:oid:2.5.4.11' => ['MA 01'],
               'urn:oid:0.9.2342.19200300.100.1.3' => ['p@extern.wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.10' => ['2.1'],
               'urn:oid:1.2.40.0.10.2.1.1.153' => ['L9-M01'],
               'urn:oid:0.9.2342.19200300.100.1.1' => ['wien1.prp9002@wien.gv.at'],
               'urn:oid:1.2.40.0.10.2.1.1.261.30' => ['access()'],
               'urn:oid:1.2.40.0.10.2.1.1.261.24' => ['L9'],
               'urn:oid:1.2.40.0.10.2.1.1.261.110' => ['1'],
               'urn:oid:1.2.40.0.10.2.1.1.3' => ['AT:VKZ:L9-M01'],
               'urn:oid:1.2.40.0.10.2.1.1.1' => ['AT:L9:1:magwien.gv.at/prp9002'],
               'http://lfrz.at/stdportal/names/pvp/gvoudomain' => ['magwien.gv.at'],
               'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14' },
              'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
              'response_object' => OneLogin::RubySaml::Response.new('fakeresponse') }
          }
        )
      end

      it 'returns placeholder' do
        expect(user_attrs).to include(
          email: 'p@extern.wien.gv.at',
          first_name: 'P',
          last_name: 'P',
          locale: 'en'
        )
      end
    end
  end
end
