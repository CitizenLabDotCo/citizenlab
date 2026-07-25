# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActiveJobRelatedGidsExtension do
  before do
    stub_const('RelatedGidsTestJob', Class.new(ApplicationJob) do
      def run(*args, **kwargs); end
    end)
  end

  describe '#serialize' do
    let(:user) { create(:user) }
    let(:phase) { create(:phase) }

    it 'stamps the gids of ActiveRecord arguments into related_gids' do
      data = RelatedGidsTestJob.new(user).serialize
      expect(data['related_gids']).to eq [user.to_global_id.to_s]
    end

    it 'collects gids nested in hashes and arrays, and plain gid:// strings, without duplicates' do
      data = RelatedGidsTestJob.new(
        user,
        payload: { records: [phase], context_gid: phase.to_global_id.to_s }
      ).serialize

      expect(data['related_gids']).to contain_exactly(user.to_global_id.to_s, phase.to_global_id.to_s)
    end

    it 'omits related_gids when no arguments reference records' do
      data = RelatedGidsTestJob.new('some-string', count: 3).serialize
      expect(data).not_to have_key('related_gids')
    end
  end

  describe 'enqueueing through Que', :active_job_que_adapter do
    it 'persists related_gids in the que_jobs args' do
      user = create(:user)
      job = RelatedGidsTestJob.perform_later(user)

      que_job = QueJob.by_job_id!(job.job_id)
      expect(que_job.args['related_gids']).to eq [user.to_global_id.to_s]
    end
  end
end
