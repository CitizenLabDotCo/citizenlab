# frozen_string_literal: true

# == Schema Information
#
# Table name: admin_publication_deletion_audits
#
#  id                   :uuid             not null, primary key
#  tenant_schema        :string
#  tenant_host          :string
#  admin_publication_id :uuid             not null
#  publication_id       :uuid
#  publication_type     :string
#  parent_id            :uuid
#  lft                  :integer
#  rgt                  :integer
#  ordering             :integer
#  publication_status   :string
#  deleted_at           :datetime
#  db_user              :string
#  application_name     :string
#  client_addr          :inet
#  backend_pid          :integer
#  transaction_id       :bigint
#  query                :text
#  reported_at          :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class AdminPublicationDeletionAudit < ApplicationRecord
  scope :recent, -> { order(deleted_at: :desc) }
  scope :unreported, -> { where(reported_at: nil) }
end
