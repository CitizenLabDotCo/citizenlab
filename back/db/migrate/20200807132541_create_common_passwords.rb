# frozen_string_literal: true

class CreateCommonPasswords < ActiveRecord::Migration[6.0]
  def change
    create_table :common_passwords, id: :uuid do |t|
      t.string :password, index: true
    end

    return unless File.exist?(CommonPassword::COMMON_PASSWORDS_FILE) && !CommonPassword.exists?

    CommonPassword.initialize!
  end
end
