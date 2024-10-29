# frozen_string_literal: true

require 'rails_helper'

describe Frontend::UrlService do
  let(:service) { described_class.new }
  let(:base_uri) { AppConfiguration.instance.base_frontend_uri }

  describe '#model_to_url' do
    let(:idea) { create(:idea) }
    let(:internal_comment1) { create(:internal_comment, post: idea) }
    let(:initiative) { create(:initiative) }
    let(:internal_comment2) { create(:internal_comment, post: initiative) }
    let(:locale) { Locale.new('en') }

    it 'returns the correct url for an internal comment on an idea' do
      expect(service.model_to_url(internal_comment1, locale: locale))
        .to eq(
          "#{base_uri}/en/admin/projects/#{internal_comment1.post.project_id}" \
          "/ideas/#{internal_comment1.post.id}##{internal_comment1.id}"
        )
    end

    it 'returns the correct url for an internal comment on an initiative' do
      expect(service.model_to_url(internal_comment2, locale: locale))
        .to eq("#{base_uri}/en/admin/initiatives/#{internal_comment2.post.id}##{internal_comment2.id}")
    end

    it 'returns the correct url for a phase' do
      project = create(:project, slug: 'my-project')
      _future_phase = create(:phase, project: project, start_at: (Time.zone.today + 20.days), end_at: (Time.zone.today + 25.days))
      _past_phase = create(:phase, project: project, start_at: (Time.zone.today - 15.days), end_at: (Time.zone.today - 10.days))
      current_phase = create(:phase, project: project, start_at: (Time.zone.today - 2.days), end_at: (Time.zone.today + 3.days))

      expect(service.model_to_url(current_phase.reload, locale: locale)).to eq "#{base_uri}/en/projects/my-project/2"
    end

    it 'returns the correct url for an event' do
      event = create(:event)

      url = service.model_to_url(event, locale: Locale.new('de-DE'))
      expect(url).to eq "#{base_uri}/de-DE/events/#{event.id}"
    end
  end

  describe '#unfollow_url' do
    let(:user) { nil }
    let(:followable) { nil }
    let(:follower) { build(:follower, followable: followable, user: user) }
    let(:url) { service.unfollow_url follower }

    context 'when the followable has a visitable page' do
      let(:followable) { create(:project, slug: 'park-renewal') }

      it 'returns the followable URL' do
        expect(url).to eq 'http://example.org/projects/park-renewal'
      end
    end

    context 'when the followable has no visitable page' do
      let(:followable) { create(:topic) }
      let(:user) { create(:user, locale: 'fr-FR', slug: 'user-slug') }

      it 'returns the profile following URL' do
        expect(url).to eq 'http://example.org/fr-FR/profile/user-slug/following'
      end
    end

    context 'when there is no followable' do
      let(:user) { create(:user, locale: 'en', slug: 'user-slug') }

      it 'returns the profile following URL' do
        expect(url).to eq 'http://example.org/en/profile/user-slug/following'
      end
    end
  end

  describe '#sso_return_url' do
    it 'returns the correct URLs when locale NOT provided' do
      expect(service.sso_return_url).to eq 'http://example.org/'
      expect(service.sso_return_url(pathname: '/')).to eq 'http://example.org/'
      expect(service.sso_return_url(pathname: '/en/some-path')).to eq 'http://example.org/en/some-path'
      expect(service.sso_return_url(pathname: '/en/another/path/')).to eq 'http://example.org/en/another/path/'
    end

    it 'returns the correct URLs when locale is provided' do
      locale =  Locale.new('nl-NL')
      expect(service.sso_return_url(locale: locale)).to eq 'http://example.org/nl-NL/'
      expect(service.sso_return_url(pathname: '/', locale: locale)).to eq 'http://example.org/nl-NL/'
      expect(service.sso_return_url(pathname: '/en/some-path', locale: locale)).to eq 'http://example.org/nl-NL/some-path'
      expect(service.sso_return_url(pathname: '/en/another/path/', locale: locale)).to eq 'http://example.org/nl-NL/another/path/'
    end
  end
end
