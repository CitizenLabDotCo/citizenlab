# frozen_string_literal: true

namespace :single_use do
  task convert_vienna_uid_to_userid: [:environment] do |_t, _args|
    Tenant.find_by(host: 'mitgestalten.wien.gv.at').switch do
      Identity.all.find_each do |identity|
        new_uid = identity.auth_hash.dig('extra', 'raw_info').to_h['urn:oid:0.9.2342.19200300.100.1.1'].first
        identity.update!(uid: new_uid)
      end
    end
  end
end
