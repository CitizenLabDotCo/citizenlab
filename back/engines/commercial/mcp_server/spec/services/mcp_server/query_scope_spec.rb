# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::QueryScope do
  describe '.for' do
    let!(:project) { create(:project) }

    before { create(:project) }

    it 'gives an admin every row' do
      expect(described_class.for(create(:admin))).to be_all
    end

    it 'gives a blocked admin no rows' do
      scope = described_class.for(create(:admin, block_end_at: 1.day.from_now))
      expect(scope.project_ids).to eq []
    end

    it 'gives a moderator the projects they moderate' do
      scope = described_class.for(create(:project_moderator, projects: [project]))
      expect(scope.project_ids).to eq [project.id]
    end

    it 'gives a resident no rows' do
      expect(described_class.for(create(:user)).project_ids).to eq []
    end

    it 'gives no user no rows' do
      expect(described_class.for(nil).project_ids).to eq []
    end
  end

  describe 'stamps' do
    it 'round-trips every row' do
      stamp = described_class.all.to_stamp
      expect(stamp).to eq 'all'
      expect(described_class.from_stamp(stamp)).to eq described_class.all
    end

    it 'round-trips a set of projects, in any order' do
      scope = described_class.new(project_ids: %w[a b])
      expect(described_class.from_stamp({ 'project_ids' => %w[b a] })).to eq scope
      expect(described_class.from_stamp(scope.to_stamp)).to eq scope
    end

    it 'refuses a stamp it does not know' do
      expect { described_class.from_stamp({}) }.to raise_error(KeyError)
    end
  end

  describe '#within?' do
    def scope(ids) = ids == :all ? described_class.all : described_class.new(project_ids: ids)

    where(:inner, :outer, :within) do
      [
        [:all, :all, true],
        [%w[a], :all, true],
        [:all, %w[a], false],
        [%w[a], %w[a b], true],
        [%w[a b], %w[a], false],
        [[], %w[a], true],
        [%w[a], [], false]
      ]
    end

    with_them do
      it { expect(scope(inner).within?(scope(outer))).to eq within }
    end
  end
end
