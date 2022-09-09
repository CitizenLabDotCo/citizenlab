# frozen_string_literal: true

# == Schema Information
#
# Table name: projects
#
#  id                           :uuid             not null, primary key
#  title_multiloc               :jsonb
#  description_multiloc         :jsonb
#  slug                         :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  header_bg                    :string
#  ideas_count                  :integer          default(0), not null
#  visible_to                   :string           default("public"), not null
#  description_preview_multiloc :jsonb
#  presentation_mode            :string           default("card")
#  participation_method         :string           default("ideation")
#  posting_enabled              :boolean          default(TRUE)
#  commenting_enabled           :boolean          default(TRUE)
#  voting_enabled               :boolean          default(TRUE), not null
#  upvoting_method              :string           default("unlimited"), not null
#  upvoting_limited_max         :integer          default(10)
#  process_type                 :string           default("timeline"), not null
#  internal_role                :string
#  survey_embed_url             :string
#  survey_service               :string
#  max_budget                   :integer
#  comments_count               :integer          default(0), not null
#  default_assignee_id          :uuid
#  poll_anonymous               :boolean          default(FALSE), not null
#  custom_form_id               :uuid
#  downvoting_enabled           :boolean          default(TRUE), not null
#  ideas_order                  :string
#  input_term                   :string           default("idea")
#  min_budget                   :integer          default(0)
#  downvoting_method            :string           default("unlimited"), not null
#  downvoting_limited_max       :integer          default(10)
#  include_all_areas            :boolean          default(FALSE), not null
#
# Indexes
#
#  index_projects_on_custom_form_id  (custom_form_id)
#  index_projects_on_slug            (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (default_assignee_id => users.id)
#
module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    # Note: This uses the main projects table as the dimension but is labelled as a view given it is still read only
    self.table_name = 'projects'
  end
end
