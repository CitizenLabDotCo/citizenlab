# frozen_string_literal: true

class ReplaceSecretWithDigestInApiClients < ActiveRecord::Migration[7.0]
  def change
    # Add the new columns
    add_column :public_api_api_clients, :secret_digest, :string
    add_column :public_api_api_clients, :secret_postfix, :string

    # Fill the new columns
    PublicApi::ApiClient.all.each do |api_client|
      next if api_client.secret.blank?

      # Generate the digest, same way as has_secure_password does it
      # from https://github.com/rails/rails/blob/cdd14ce1f5196e4bd98df42f89a1cd36ba9d4bee/activemodel/lib/active_model/secure_password.rb#L124C2-L124C2
      cost = ActiveModel::SecurePassword.min_cost ? BCrypt::Engine::MIN_COST : BCrypt::Engine.cost
      secret_digest = BCrypt::Password.create(api_client.secret, cost: cost)
      secret_postfix = api_client.secret[-4..]

      ActiveRecord::Base.connection.execute(<<~SQL.squish
        UPDATE public_api_api_clients
        SET
          secret_digest = '#{secret_digest}',
          secret_postfix = '#{secret_postfix}'
        WHERE
          id = '#{api_client.id}'
      SQL
                                           )
    end

    # Now the data is present, add the null constraints
    change_column :public_api_api_clients, :secret_digest, :string, null: false
    change_column :public_api_api_clients, :secret_postfix, :string, null: false

    # Delete the plaintext secret
    remove_column :public_api_api_clients, :secret
  end
end
