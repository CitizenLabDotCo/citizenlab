# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::TrafficSources do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'identifies search engines' do
      create(:session, referrer: 'https://www.google.com/')
      create(:session, referrer: 'https://www.bing.com/')
      create(:session, referrer: 'https://bing.com/')
      create(:session, referrer: 'https://www.google.nl/')
      create(:session, referrer: 'https://www.google.co.uk/')
      create(:session, referrer: 'android-app://com.google.android.googlequicksearchbox/')
      create(:session, referrer: 'https://duckduckgo.com/')
      create(:session, referrer: 'https://www.ecosia.org/')
      create(:session, referrer: 'https://search.yahoo.com/')
      create(:session, referrer: 'https://cl.search.yahoo.com/')
      create(:session, referrer: 'https://yandex.ru/')
      create(:session, referrer: 'https://www.msn.com/')
      create(:session, referrer: 'https://www.qwant.com/')
      create(:session, referrer: 'https://www.startpage.com/')
      create(:session, referrer: 'https://search.brave.com/')

      expect(query.run_query).to eq({
        sessions_per_referrer_type: {
          'search_engine' => 15,
        }
      })
    end

    # it 'identifies social networks' do
      # TODO
    # end

    # it 'identifies email campaigns' do
    #   create(:session, referrer: 'android-app://com.google.android.gm/') # gmail app
    #   create(:session, referrer: 'https://mail.google.com/') # gmail web
    #   create(:session, referrer: 'https://eb05g.r.ag.d.sendibm3.com/') # brevo
    #   create(:session, referrer: 'https://b12s9.r.sp1-brevo.net/') # brevo
    #   create(:session, referrer: 'ttps://email.bt.com/')
    #   create(:session, referrer: 'https://outlook.live.com/')
    #   create(:session, referrer: 'https://deref-gmx.net/')
    #   create(:session, referrer: 'https://mail02.orange.fr/')

    #   # TODO
    # end

    # it 'identifies direct traffic' do
      # TODO
    # end

    # it 'identifies other traffic' do
      # TODO
    # end

    # it 'ignores SSO redirects' do
      # TODO
    # end
  end
end
