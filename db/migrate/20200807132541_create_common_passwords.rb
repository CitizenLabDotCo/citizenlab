class CreateCommonPasswords < ActiveRecord::Migration[6.0]

  COMMON_PASSWORDS_FILE = './public/common_passwords/100k-most-used-passwords-NCSC.txt'

  def change
    create_table :common_passwords, id: :uuid do |t|
      t.string :password, index: true
      t.integer :freq_ordering
    end

    if File.exists?(COMMON_PASSWORDS_FILE) && !CommonPassword.exists?
      pwds = open(COMMON_PASSWORDS_FILE).readlines.map.with_index do |password, index|
        CommonPassword.new password: password.strip, freq_ordering: index
      end
      # Bulk insert in one query
      CommonPassword.import pwds
    end
  end
end
