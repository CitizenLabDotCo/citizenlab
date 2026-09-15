# frozen_string_literal: true

require 'rails_helper'

describe Analytics::Query do
  subject(:service) { described_class.new }

  describe '#initialize' do
    it 'accepts ActionController::Parameters' do
      params = ActionController::Parameters.new({})
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'accepts Hash' do
      params = {}
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'accepts HashWithIndifferentAccess' do
      params = {}.with_indifferent_access
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'raises ArgumentError for other types' do
      expect { described_class.new('string') }.to raise_error(ArgumentError)
    end

    describe 'exclude_roles' do
      let(:exclude_roles) { 'exclude_admins_and_moderators' }

      %w[email_delivery participation post registration session visit].each do |fact|
        it "adds a role filter for the #{fact} fact" do
          query = described_class.new({ fact: fact }, exclude_roles: exclude_roles)
          expect(query.json_query[:filters]).to eq({ 'dimension_user.role' => ['citizen', nil] })
        end
      end

      %w[event project_status].each do |fact|
        it "does not add a role filter for the #{fact} fact, which has no users" do
          query = described_class.new({ fact: fact }, exclude_roles: exclude_roles)
          expect(query.json_query).not_to have_key(:filters)
        end
      end

      it 'keeps the other filters' do
        query = described_class.new(
          { fact: 'participation', filters: { 'dimension_project.id' => 'some-id' } },
          exclude_roles: exclude_roles
        )

        expect(query.json_query[:filters]).to eq({
          'dimension_project.id' => 'some-id',
          'dimension_user.role' => ['citizen', nil]
        })
      end

      it 'only keeps the requested roles that are not excluded' do
        role_filter = lambda do |roles|
          query = described_class.new({ fact: 'visit', filters: { 'dimension_user.role' => roles } }, exclude_roles: exclude_roles)
          query.json_query[:filters]['dimension_user.role']
        end

        expect(role_filter.call('citizen')).to eq(['citizen'])
        expect(role_filter.call(['citizen', ''])).to eq(['citizen', nil])
        expect(role_filter.call(%w[admin project_moderator])).to eq([])
      end

      it 'does nothing when exclude_roles is not set or has another value' do
        [nil, 'something_else'].each do |value|
          query = described_class.new({ fact: 'participation' }, exclude_roles: value)
          expect(query.json_query).not_to have_key(:filters)
        end
      end

      it 'does nothing for an unknown or missing fact' do
        expect(described_class.new({ fact: 'unknown' }, exclude_roles: exclude_roles).json_query).not_to have_key(:filters)
        expect(described_class.new({}, exclude_roles: exclude_roles).json_query).not_to have_key(:filters)
      end
    end
  end
end
