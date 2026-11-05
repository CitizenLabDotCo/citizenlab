# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::TenantDeserializer do
  let(:service) { described_class.new }

  describe '#deserialize' do
    it 'associates refs correctly, when the target of the ref has exactly the same attributes' do
      yml = <<~YAML
        ---
        models:
          project:
          - &3
            title_multiloc:
              en: Project 1
          - &4
            title_multiloc:
              en: Project 2
          admin_publication:
          - publication_ref: *3
            publication_status: published
          - publication_ref: *4
            publication_status: published
          custom_form:
          - &1
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
            participation_context_ref: *3
          - &2
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
            participation_context_ref: *4
          custom_field:
            - resource_type: CustomForm
              resource_ref: *1
              key: body_multiloc
              input_type: multiline_text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Debitis expedita qui nostrum.
              code: body_multiloc
              answers_visible_to: public
            - resource_type: CustomForm
              resource_ref: *2
              key: title_multiloc
              input_type: text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Minima et ipsa debitis.
              code: title_multiloc
              answers_visible_to: public
      YAML

      template = YAML.load(yml, aliases: true)

      service.deserialize(template)

      expect(CustomForm.count).to eq 2
      expect(CustomField.count).to eq 2
      expect(CustomField.all.map(&:resource)).to match_array CustomForm.all
    end

    it 'ignores removed attributes still present in templates serialized before their removal' do
      yml = <<~YAML
        ---
        models:
          project:
          - &1
            title_multiloc:
              en: Legacy project
            description_multiloc:
              en: "<p>Legacy description</p>"
          project_folders/folder:
          - &2
            title_multiloc:
              en: Legacy folder
            description_multiloc:
              en: "<p>Legacy folder description</p>"
          admin_publication:
          - publication_ref: *1
            publication_status: published
          - publication_ref: *2
            publication_status: published
      YAML

      template = YAML.load(yml, aliases: true)

      service.deserialize(template)

      expect(Project.count).to eq 1
      expect(ProjectFolders::Folder.count).to eq 1
    end

    it 'creates all records and resolves refs when the records span several transaction batches' do
      stub_const("#{described_class}::TRANSACTION_BATCH_SIZE", 2)

      template = YAML.load(<<~YAML, aliases: true)
        ---
        models:
          project:
          - &1
            title_multiloc:
              en: Project 1
          - &2
            title_multiloc:
              en: Project 2
          - &3
            title_multiloc:
              en: Project 3
          admin_publication:
          - publication_ref: *1
            publication_status: published
          - publication_ref: *2
            publication_status: draft
          - publication_ref: *3
            publication_status: archived
      YAML

      service.deserialize(template)

      statuses = Project.all.to_h { |project| [project.title_multiloc['en'], project.admin_publication.publication_status] }
      expect(statuses).to eq(
        'Project 1' => 'published',
        'Project 2' => 'draft',
        'Project 3' => 'archived'
      )
    end

    context 'with bulk: true' do
      # The state that bulk insertion and deferred counter caches could get wrong.
      def snapshot
        {
          counts: [Comment, CustomFieldAnswer, EmailCampaigns::Consent, Follower, Reaction].to_h { |k| [k.name, k.count] },
          ideas: Idea.all.to_h do |idea|
            [idea.title_multiloc['en'], idea.slice(:likes_count, :dislikes_count, :comments_count, :followers_count)]
          end,
          comments: Comment.all.to_h { |comment| [comment.body_multiloc['en'], comment.slice(:likes_count, :dislikes_count)] },
          projects: Project.all.to_h { |project| [project.title_multiloc['en'], project.slice(:comments_count, :followers_count)] },
          users: User.all.to_h { |user| [user.email, user.slice(:followings_count)] },
          answers: CustomFieldAnswer.all.map { |answer| [answer.answerable_type, answer.key, answer.value] }.sort_by(&:to_s),
          consents: EmailCampaigns::Consent.all.map { |consent| [consent.user.email, consent.campaign_type, consent.consented] }.sort
        }
      end

      it 'creates the same records and counter caches as the source tenant' do
        project = create(:project_with_active_ideation_phase, title_multiloc: { 'en' => 'Project' })
        ideas = Array.new(2) do |i|
          create(:idea, project: project, phases: project.phases, title_multiloc: { 'en' => "Idea #{i}" })
        end
        users = create_list(:user, 3)

        comment = create(:comment, idea: ideas[0], body_multiloc: { 'en' => 'Comment' })
        create(:comment, idea: ideas[0], parent: comment, body_multiloc: { 'en' => 'Reply' })
        create(:comment, idea: ideas[1], body_multiloc: { 'en' => 'Other comment' })

        create(:reaction, reactable: ideas[0], user: users[0])
        create(:dislike, reactable: ideas[0], user: users[1])
        create(:reaction, reactable: ideas[1], user: users[0])
        create(:comment_reaction, reactable: comment, user: users[2])

        create(:follower, followable: project, user: users[0])
        create(:follower, followable: ideas[0], user: users[0])
        create(:follower, followable: ideas[0], user: users[1])

        field = create(:custom_field)
        create(:custom_field_answer, answerable: users[0], key: field.key, value: 'blue')
        create(:consent, user: users[1], consented: false)

        expected = snapshot
        expect(expected[:counts]).to include('Reaction' => 4, 'Follower' => 3, 'CustomFieldAnswer' => 1)
        expect(expected[:ideas]['Idea 0']).to include('likes_count' => 1, 'dislikes_count' => 1, 'comments_count' => 2)

        template = MultiTenancy::Templates::TenantSerializer.new(Tenant.current).run(deserializer_format: true)
        tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))

        tenant.switch do
          service.deserialize(template, bulk: true)
          expect(snapshot).to eq(expected)
        end
      end

      it 'defers the counter caches of all bulk inserted models, since insert_all skips callbacks' do
        with_counter_caches = described_class::BULK_INSERT_MODELS.select do |model_name|
          model_name.constantize.after_commit_counter_cache.present?
        end

        expect(described_class::DEFERRED_COUNTER_CACHE_MODELS.keys).to include(*with_counter_caches)
      end

      # The BULK_INSERT_MODELS are inserted with `insert_all!` when applying a template, which
      # skips all their callbacks. This spec makes sure that nobody adds a callback to one of
      # these models without realising that it won't run when applying a template.
      #
      # If you are seeing this spec fail, it's because you added a callback to one of the
      # listed models. Make sure that the tenants created from a template are still correct
      # without that callback running for the records of the template (e.g. it only matters
      # for records created by users, or its effect is recomputed after the template is
      # applied). Only then add it to `allowed` below. Otherwise, remove the model from
      # BULK_INSERT_MODELS, so that its records are saved one by one again.
      it 'fails when a bulk inserted model gets a callback that bulk insertion would skip' do
        # Callbacks added by Rails and gems, which are covered by the bulk insertion: the
        # associations are resolved to ids and the counter caches are recomputed afterwards.
        framework = /\A(autosave_associated_records_for_|_update_counts_|normalize_changed_in_place_attributes\z|generate_slug\z)/
        allowed = {
          # No-op when applying a template: there's no location data to track.
          'Reaction' => %i[track_participation_location]
        }

        callback_kinds = %i[validation save create commit]

        described_class::BULK_INSERT_MODELS.each do |model_name|
          model = model_name.constantize
          callbacks = callback_kinds.flat_map do |kind|
            model.public_send(:"_#{kind}_callbacks").map(&:filter)
          end
          unexpected = callbacks.reject { |filter| filter.is_a?(Symbol) && filter.match?(framework) }
          unexpected -= allowed.fetch(model_name, [])

          expect(unexpected).to be_empty, <<~MSG.squish
            #{model_name} has callbacks that are skipped when applying a template:
            #{unexpected.inspect}. See the comment above this spec.
          MSG
        end
      end

      it 'inserts the bulk models in batches' do
        stub_const("#{described_class}::BULK_INSERT_BATCH_SIZE", 2)
        create_list(:reaction, 5)

        template = MultiTenancy::Templates::TenantSerializer.new(Tenant.current).run(deserializer_format: true)
        tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))

        tenant.switch do
          inserts = 0
          counter = ->(*, payload) { inserts += 1 if payload[:sql].start_with?('INSERT INTO "reactions"') }
          ActiveSupport::Notifications.subscribed(counter, 'sql.active_record') do
            service.deserialize(template, bulk: true)
          end

          expect(inserts).to eq 3
          expect(Reaction.count).to eq 5
          expect(Idea.sum(:likes_count)).to eq 5
        end
      end
    end

    context 'with a reuse_by matcher' do
      let(:folder) { create(:project_folder, title_multiloc: { 'en' => 'Shared folder' }) }
      let(:reuse_by) do
        { 'ProjectFolders::Folder' => ->(attrs, klass) { klass.find_by("title_multiloc->>'en' = ?", attrs.dig('title_multiloc', 'en')) } }
      end
      let(:template) do
        YAML.load(<<~YAML, aliases: true)
          ---
          models:
            project_folders/folder:
            - title_multiloc:
                en: Shared folder
              admin_publication_attributes: &folderpub
                publication_status: published
            project:
            - title_multiloc:
                en: Child project
              admin_publication_attributes:
                publication_status: published
                parent_attributes_ref: *folderpub
        YAML
      end

      it 'reuses the matched record instead of duplicating it, resolving refs (incl. nested) to it' do
        folder # create the existing folder first

        expect { service.deserialize(template, reuse_by: reuse_by) }.to change(Project, :count).by(1)
        expect(ProjectFolders::Folder.count).to eq(1) # reused, not re-created

        # the child project's admin_publication parent resolves to the *existing* folder's admin_publication
        child = Project.find_by("title_multiloc->>'en' = 'Child project'")
        expect(child.admin_publication.parent).to eq(folder.admin_publication)
      end

      it 'creates the record normally when the matcher finds nothing' do
        expect { service.deserialize(template, reuse_by: reuse_by) }
          .to change(ProjectFolders::Folder, :count).by(1) # no existing "Shared folder" → created
      end
    end

    describe 'filtering of template multiloc attributes' do
      let(:platform_locales) { ['en'] }
      let(:template) do
        YAML.load(<<~YAML, permitted_classes: [Time], aliases: true)
          models:
            project:
              - &project
                title_multiloc:
                  en: Project
                  nl-BE: Project
            admin_publication:
              - publication_ref: *project
                publication_status: published
            idea_status:
              - title_multiloc: idea_statuses.proposed
                ordering: 100
                code: proposed
                color: '#687782'
                description_multiloc: idea_statuses.proposed_description
            idea:
              - title_multiloc:
                  en: Cleaning the sidewalks party
                  nl-BE: Schoonmaken van de trottoirs feest
                body_multiloc:
                  en: "<p>Let's get together to have a cleaning party!<p>"
                  nl-BE: "<p>Laten we samen een schoonmaakfeest houden!<p>"
                publication_status: published
                location_description: 8185 Austen Green
                project_ref: *project
                published_at: '2018-03-03 00:00:00'
                created_at: '2018-02-22 00:00:00'
                updated_at: '2018-03-28 13:35:10'
        YAML
      end

      before do
        app_config = AppConfiguration.instance
        app_config.settings['core']['locales'] = platform_locales
        app_config.save!
      end

      it 'removes non-platform locales from citizen inputs' do
        service.deserialize(template)

        idea = Idea.first
        expect(idea.title_multiloc.keys).to eq(platform_locales)
        expect(idea.body_multiloc.keys).to eq(platform_locales)
      end

      it 'does not remove locales from other models (non-citizen inputs)' do
        service.deserialize(template)

        project = Project.first
        expect(project.title_multiloc.keys).to eq(%w[en nl-BE])
      end

      it 'falls back to another (unspecified) locale if all locales are filtered out' do
        template.dig('models', 'idea', 0, 'body_multiloc').except!(*platform_locales)

        service.deserialize(template)

        idea = Idea.first
        expect(idea.body_multiloc.keys).to contain_exactly('nl-BE')
      end
    end

    # Templates carry model data but no feature flags (AppConfiguration is not serialized),
    # so a template derived from a platform with screening enabled records a
    # `prescreening_mode` that the target platform may have no feature for. Applying it
    # must succeed regardless; the mode simply has no effect where the feature is off.
    describe 'a phase with a prescreening_mode' do
      let(:template) do
        YAML.load(<<~YAML, permitted_classes: [Time], aliases: true)
          models:
            project:
              - &project
                title_multiloc:
                  en: Project
            admin_publication:
              - publication_ref: *project
                publication_status: published
            phase:
              - project_ref: *project
                title_multiloc:
                  en: Ideation phase
                participation_method: ideation
                start_at: '2026-01-01'
                end_at: '2026-12-31'
                prescreening_mode: all
        YAML
      end

      context 'when the target platform does not have the prescreening feature' do
        it 'applies the template, storing the mode but leaving it without effect' do
          expect { service.deserialize(template) }.not_to raise_error

          phase = Phase.first
          expect(phase.prescreening_mode).to eq 'all'
          expect(phase.prescreening_all?).to be false
        end
      end

      context 'when the target platform has the prescreening feature' do
        before { SettingsService.new.activate_feature!('prescreening_ideation') }

        it 'applies the template, and the mode takes effect' do
          service.deserialize(template)

          phase = Phase.first
          expect(phase.prescreening_mode).to eq 'all'
          expect(phase.prescreening_all?).to be true
        end
      end
    end
  end
end
