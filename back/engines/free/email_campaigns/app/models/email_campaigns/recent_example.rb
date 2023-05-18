# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_recent_examples
#
#  id             :uuid             not null, primary key
#  type           :string           not null
#  mail_body_html :string           not null
#  locale         :string           not null
#  subject        :string           not null
#  recipient      :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_email_campaigns_recent_examples_on_type  (type)
#
module EmailCampaigns
  class RecentExample < ApplicationRecord
  end
end
