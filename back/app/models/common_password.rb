# frozen_string_literal: true

# == Schema Information
#
# Table name: public.common_passwords
#
#  id       :uuid             not null, primary key
#  password :string
#
# Indexes
#
#  index_common_passwords_on_password  (password)
#
class CommonPassword < ApplicationRecord
  # https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/Pwdb_top-1000000.txt
  COMMON_PASSWORDS_FILE = './public/common_passwords/Pwdb_top-1000000.txt'
  TEST_PASSWORDS_FILE = './spec/fixtures/common_passwords_test.txt'

  def self.initialize!
    # Use the large file only in production, to keep db:reset fast in other environments.
    file_path = Rails.env.production? ? COMMON_PASSWORDS_FILE : TEST_PASSWORDS_FILE

    CommonPassword.delete_all
    pwds = open(file_path).readlines.map do |password|
      CommonPassword.new password: password.strip
    end
    # Bulk insert in one query
    CommonPassword.import pwds
  end

  def self.check(password)
    # Returns true when the password is common
    exists?(password: password)
  end
end
