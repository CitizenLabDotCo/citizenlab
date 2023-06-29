# frozen_string_literal: true

require 'rails_helper'

describe Frontend::UrlService do
  let(:service) { described_class.new }

  describe '#model_to_url' do
    let(:idea) { create(:idea) }
    let(:internal_comment1) { create(:internal_comment, post: idea) }
    let(:initiative) { create(:initiative) }
    let(:internal_comment2) { create(:internal_comment, post: initiative) }

    it 'returns the correct url for an internal comment on an idea' do
      expect(service.model_to_url(internal_comment1))
        .to include(
          "://#{Tenant.current.host}/admin/projects/#{internal_comment1.post.project_id}" \
          "/ideas/#{internal_comment1.post.id}##{internal_comment1.id}"
        )
    end

    it 'returns the correct url for an internal comment on an initiative' do
      expect(service.model_to_url(internal_comment2))
        .to include(
          "://#{Tenant.current.host}/admin/initiatives/#{internal_comment2.post.id}##{internal_comment2.id}"
        )
    end
  end
end
