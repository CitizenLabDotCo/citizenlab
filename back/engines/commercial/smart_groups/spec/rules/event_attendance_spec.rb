# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SmartGroups::Rules::EventAttendance do
  describe '.from_json' do
    let(:event_ids) { create_list(:event, 2).map(&:id) }
    let(:json_rule) do
      {
        'ruleType' => 'event_attendances',
        'predicate' => 'attends_some_of',
        'value' => event_ids
      }
    end

    it 'successfully parses a rule described as json' do
      rule = described_class.from_json(json_rule)
      expect(rule.predicate).to eq json_rule['predicate']
      expect(rule.value).to eq json_rule['value']
    end
  end

  describe 'validations' do
    let_it_be(:event_ids) { create_list(:event, 2).map(&:id) }

    where(:predicate, :value, :error_messages) do
      [
        ['attends_something', nil, []],
        ['attends_nothing', nil, []],

        ['attends_something', ref(:event_ids), ['Value must be blank']],
        ['attends_something', lazy { event_ids.first }, ['Value must be blank']],
        [:attends_something, nil, ['Predicate is not included in the list']],

        ['attends_some_of', ref(:event_ids), []],
        ['attends_none_of', ref(:event_ids), []],

        ['attends_some_of', [], ["Value can't be blank"]],
        ['attends_some_of', ['non-existent-id'], ['Value contains invalid event identifiers']],
        ['attends_some_of', lazy { ['bad-id', *event_ids] }, ['Value contains invalid event identifiers']],
        ['attends_none_of', [], ["Value can't be blank"]],
        ['attends_none_of', ['non-existent-id'], ['Value contains invalid event identifiers']],
        ['attends_none_of', lazy { ['bad-id', *event_ids] }, ['Value contains invalid event identifiers']]
      ]
    end

    with_them do
      let(:rule) { described_class.new(predicate, value) }

      specify do
        expect(rule.valid?).to eq(error_messages.empty?)
        expect(rule.errors.full_messages).to match_array(error_messages)
      end
    end
  end

  describe '#filter' do
    let_it_be(:event1) { create(:event) }
    let_it_be(:event2) { create(:event) }
    let_it_be(:attends_nothing_users) { create_list(:user, 2) }

    let_it_be(:user1) do
      create(:user).tap { |user| user.attended_events << event1 }
    end

    let_it_be(:user2) do
      create(:user).tap { |user| user.attended_events << event2 }
    end

    it 'correctly selects users that attend something' do
      rule = described_class.new('attends_something')
      expect(rule.filter(User.all)).to contain_exactly(user1, user2)
    end

    it 'correctly selects users that attend nothing' do
      rule = described_class.new('attends_nothing')
      expect(rule.filter(User.all)).to match_array attends_nothing_users
    end

    it 'correctly selects users that attend some of the events (single event)' do
      rule = described_class.new('attends_some_of', [event1.id])
      expect(rule.filter(User.all)).to contain_exactly(user1)
    end

    it 'correctly selects users that attend some of the events (multiple events)' do
      rule = described_class.new('attends_some_of', [event1.id, event2.id])
      expect(rule.filter(User.all)).to contain_exactly(user1, user2)
    end

    it 'correctly selects users that attend none of the events (single event)' do
      rule = described_class.new('attends_none_of', [event1.id])
      expect(rule.filter(User.all)).to contain_exactly(user2, *attends_nothing_users)
    end

    it 'correctly selects users that attend none of the events (multiple events)' do
      rule = described_class.new('attends_none_of', [event1.id, event2.id])
      expect(rule.filter(User.all)).to match_array attends_nothing_users
    end
  end

  describe '#description_multiloc' do
    let_it_be(:event1) { create(:event, title_multiloc: { 'en' => 'Event 1' }) }
    let_it_be(:event2) { create(:event, title_multiloc: { 'en' => 'Event 2' }) }

    it 'returns a description for attends_something' do
      rule = described_class.new('attends_something')
      expect(rule.description_multiloc).to eq({
        'en' => 'User is registered for at least one event',
        'nl-NL' => 'Gebruiker is ingeschreven voor minstens één evenement',
        'fr-FR' => "L'utilisateur est inscrit à au moins un événement"
      })
    end

    it 'returns a description for attends_nothing' do
      rule = described_class.new('attends_nothing')
      expect(rule.description_multiloc).to eq({
        'en' => 'User is not registered for any event',
        'nl-NL' => 'Gebruiker is niet ingeschreven voor een evenement',
        'fr-FR' => "L'utilisateur n'est inscrit à aucun événement"
      })
    end

    it 'returns a description for attends_some_of' do
      rule = described_class.new('attends_some_of', [event1.id])
      expect(rule.description_multiloc).to eq({
        'en' => 'User is registered for at least one of the following events: Event 1',
        'nl-NL' => 'Gebruiker is ingeschreven voor minstens één van de volgende evenementen: Event 1',
        'fr-FR' => "L'utilisateur est inscrit à au moins un des événements suivants: Event 1"
      })
    end

    it 'returns a description for attends_none_of' do
      rule = described_class.new('attends_none_of', [event1.id, event2.id])
      expect(rule.description_multiloc).to eq({
        'en' => 'User is not registered for any of the following events: Event 1, Event 2',
        'nl-NL' => 'Gebruiker is niet ingeschreven voor een van de volgende evenementen: Event 1, Event 2',
        'fr-FR' => "L'utilisateur n'est inscrit à aucun des événements suivants: Event 1, Event 2"
      })
    end
  end
end
