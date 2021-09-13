# frozen_string_literal: true

module Insights
  class TextNetwork < ::ApplicationRecord
    belongs_to :view, class_name: 'Insights::View'

    validates :json_network, presence: true
    validates :view, presence: true
    validates :language, presence: true, uniqueness: { scope: [:view_id] }

    def network
      @network ||= NLP::TextNetwork.from_json(json_network)
    end

    # @param [NLP::TextNetwork] text_network
    def network=(text_network)
      self.json_network = text_network.as_json
    end
  end
end
