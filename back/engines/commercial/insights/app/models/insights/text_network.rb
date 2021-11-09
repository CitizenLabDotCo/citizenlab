# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_text_networks
#
#  id           :uuid             not null, primary key
#  view_id      :uuid             not null
#  language     :string           not null
#  json_network :jsonb            not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_insights_text_networks_on_language              (language)
#  index_insights_text_networks_on_view_id               (view_id)
#  index_insights_text_networks_on_view_id_and_language  (view_id,language) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (view_id => insights_views.id)
#
module Insights
  class TextNetwork < ::ApplicationRecord
    belongs_to :view, class_name: 'Insights::View'

    validates :json_network, presence: true
    validates :view, presence: true
    validates :language, presence: true, uniqueness: { scope: [:view_id] }

    delegate :nodes, :node, :links, :communities, to: :network

    def network
      @network ||= NLP::TextNetwork.from_json(json_network)
    end

    # @param [NLP::TextNetwork] text_network
    def network=(text_network)
      self.json_network = text_network.as_json
    end
  end
end
