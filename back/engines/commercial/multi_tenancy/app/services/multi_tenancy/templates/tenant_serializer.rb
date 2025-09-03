# frozen_string_literal: true

module MultiTenancy
  module Templates
    class TenantSerializer
      def initialize(tenant, serialization_params = {})
        @tenant = tenant
        @serialization_params = serialization_params
      end

      def run(deserializer_format: false)
        models = @tenant.switch { serialize_models }
        models = sort_by_references(models)
        resolve_references!(models)

        { 'models' => models }.tap do |template|
          self.class.format_for_deserializer!(template) if deserializer_format
        end
      end

      # Transform the models hash to make it compatible with the `TenantDeserializer`.
      def self.format_for_deserializer!(template)
        models = template['models']
        models.transform_keys! { |record_class| ::Utils.snakecase(record_class.name) }
        models.transform_values!(&:values)
        models.deep_transform_keys!(&:to_s)
      end

      private

      def serialize_models
        email_campaigns = EmailCampaigns::Campaign.manual
        groups = Group.where(membership_type: 'manual')
        ideas = Idea.submitted_or_published
        users = User.where('invite_status IS NULL OR invite_status != ?', 'pending')

        {
          AdminPublication => serialize_admin_publications(AdminPublication),
          Area => serialize_records(Area),
          AreasProject => serialize_records(AreasProject),
          AreasStaticPage => serialize_records(AreasStaticPage),
          Basket => serialize_records(Basket),
          ContentBuilder::Layout => serialize_records(ContentBuilder::Layout),
          ContentBuilder::LayoutImage => serialize_records(ContentBuilder::LayoutImage),
          CustomField => serialize_records(CustomField),
          CustomForm => serialize_records(CustomForm),
          Event => serialize_records(Event),
          EventFile => serialize_records(EventFile),
          EventImage => serialize_records(EventImage),
          Events::Attendance => serialize_records(Events::Attendance),
          IdeaStatus => serialize_records(IdeaStatus),
          NavBarItem => serialize_records(NavBarItem),
          Permission => serialize_records(Permission),
          PermissionsCustomField => serialize_records(PermissionsCustomField),
          Phase => serialize_records(Phase),
          PhaseFile => serialize_records(PhaseFile),
          Project => serialize_records(Project),
          ProjectFile => serialize_records(ProjectFile),
          ProjectFolders::File => serialize_records(ProjectFolders::File),
          ProjectFolders::Folder => serialize_records(ProjectFolders::Folder),
          ProjectFolders::Image => serialize_records(ProjectFolders::Image),
          ProjectImage => serialize_records(ProjectImage),
          ProjectsAllowedInputTopic => serialize_records(ProjectsAllowedInputTopic),
          ReportBuilder::Report => serialize_records(ReportBuilder::Report),
          StaticPagesTopic => serialize_records(StaticPagesTopic),
          StaticPage => serialize_records(StaticPage),
          StaticPageFile => serialize_records(StaticPageFile),
          Topic => serialize_records(Topic),

          # It is not necessary to serialize the CustomFieldOption records for the
          # 'domicile' custom field because they will be created automatically from
          # the areas when loading the template.
          CustomFieldOption => serialize_records(
            CustomFieldOption.where(
              custom_field: CustomField.where.not(code: 'domicile').or(CustomField.where(code: nil))
            )
          ),
          CustomFieldOptionImage => serialize_records(CustomFieldOptionImage),

          # Custom maps
          CustomMaps::Layer => serialize_records(CustomMaps::Layer),
          CustomMaps::MapConfig => serialize_records(CustomMaps::MapConfig),

          # Polls
          Polls::Option => serialize_records(Polls::Option),
          Polls::Question => serialize_records(Polls::Question),
          Polls::Response => serialize_records(Polls::Response),
          Polls::ResponseOption => serialize_records(Polls::ResponseOption),

          # Volunteering
          Volunteering::Cause => serialize_records(Volunteering::Cause),
          Volunteering::Volunteer => serialize_records(Volunteering::Volunteer),

          # Ideas
          Idea => serialize_records(ideas),
          BasketsIdea => serialize_records(BasketsIdea.where(idea: ideas)),
          IdeaFile => serialize_records(IdeaFile.where(idea: ideas)),
          IdeaImage => serialize_records(IdeaImage.where(idea: ideas)),
          IdeasPhase => serialize_records(IdeasPhase.where(idea: ideas)),
          IdeasTopic => serialize_records(IdeasTopic.where(idea: ideas)),

          Comment => serialize_comments(ideas),
          InternalComment => serialize_internal_comments(ideas),
          Reaction => serialize_reactions(ideas),
          OfficialFeedback => serialize_records(OfficialFeedback),
          Cosponsorship => serialize_records(Cosponsorship.where(idea: ideas)),

          # Groups
          Group => serialize_records(groups),
          GroupsPermission => serialize_records(GroupsPermission.where(group: groups)),
          GroupsProject => serialize_records(GroupsProject.where(group: groups)),

          # EmailCampaigns
          EmailCampaigns::Campaign => serialize_records(email_campaigns),
          EmailCampaigns::UnsubscriptionToken => serialize_records(EmailCampaigns::UnsubscriptionToken.where(user: users)),

          # Users
          User => serialize_records(users),
          Membership => serialize_records(Membership.where(user: users)),
          Follower => serialize_followers(users),

          TextImage => serialize_records(TextImage.where(imageable: [
            CustomField.all,
            Event.all,
            Phase.all,
            Project.all,
            StaticPage.all,
            email_campaigns,
            ideas
          ]))
        }
      end

      # Reorder the classes in the models hash so that the classes that hold
      # references to other classes are always after the classes they reference.
      # @raise [TSort::Cyclic] if there is a circular dependency between the classes
      #   and the class cannot be sorted.
      def sort_by_references(models)
        graph = extract_dependencies_graph(models)

        each_node = ->(&process_node) { graph.each_key(&process_node) }
        each_child = ->(node, &process_child) { graph.fetch(node).each(&process_child) }

        sorted_classes = TSort.tsort(each_node, each_child)
        models.slice(*sorted_classes)
      end

      # Returns a hash with the classes as keys and an array of the classes that
      # they reference as values. For instance:
      #   {
      #     Area => [],
      #     Basket => [Phase, User],
      #     CustomFieldOption => [CustomField]
      #     # ...
      #   }
      #
      # @return [Hash<Class, Array<Class>>]
      def extract_dependencies_graph(models)
        graph = models.transform_values do |records|
          records.flat_map do |_id, attributes|
            attributes.values.filter do |value|
              value.is_a?(Serializers::Core::Ref) && value.id
            end.map(&:klass)
          end.uniq
        end

        # User depends on CustomField because of the custom field values. We have to add
        # this dependency manually because the custom field values are stored as JSON in
        # the database, so serialized users don't hold references to CustomField.
        if graph.key?(User) && graph.key?(CustomField)
          graph[User] << CustomField
        end

        graph
      end

      # Replace the Ref objects in the models hash with actual references to the
      # serialized records that they point to.
      def resolve_references!(models)
        models.each do |record_class, instances|
          instances.each do |identifier, serialized_instance|
            serialized_instance.transform_values! { |value| value.resolve(models) }
          rescue Serializers::Core::Ref::UnresolvedReferenceError => e
            raise <<~ERROR.squish
              Could not resolve reference of #{record_class.name} (id: #{identifier}) 
              to #{e.klass} (id: #{e.id}).
            ERROR
          end
        end
      end

      def serialize_records(scope)
        scope = scope.all if scope.is_a?(Class)
        record_class = infer_scope_class(scope)

        return {} if record_class.nil? && scope.size == 0 # rubocop:disable Style/ZeroLengthPredicate

        Rails.logger.info "Serializing #{record_class.name}"
        serializer_class = MultiTenancy::Templates::Serializers.const_get(record_class.name)
        serializer = serializer_class.new(**@serialization_params)
        scope.to_h { |record| [record.id, serializer.serialize(record)] }
      end

      def infer_scope_class(scope)
        case scope
        when ActiveRecord::Relation then scope.klass
        when Enumerator then scope.first&.class
        else raise "Unsupported scope type: #{scope.inspect}."
        end
      end

      def serialize_admin_publications(scope)
        # This code will stop working when folders can contain folders
        serialize_records(scope.order(parent_id: :desc, ordering: :asc))
      end

      def serialize_comments(scope)
        comments = serialize_records(Comment.where(idea: scope))

        # The parent comments must be listed before their children since the
        # children comments reference their parent.
        child_to_parent = comments.transform_values do |attributes|
          Array.wrap(attributes[:parent_ref]&.id)
        end

        each_node = ->(&block) { child_to_parent.each_key(&block) }
        each_child = ->(node, &block) { child_to_parent[node].each(&block) }
        ordered_ids = TSort.tsort(each_node, each_child)

        comments.slice(*ordered_ids)
      end

      def serialize_internal_comments(scope)
        internal_comments = serialize_records(InternalComment.where(idea: scope))

        # The parent internal_comments must be listed before their children since the
        # children internal_comments reference their parent.
        child_to_parent = internal_comments.transform_values do |attributes|
          Array.wrap(attributes[:parent_ref]&.id)
        end

        each_node = ->(&block) { child_to_parent.each_key(&block) }
        each_child = ->(node, &block) { child_to_parent[node].each(&block) }
        ordered_ids = TSort.tsort(each_node, each_child)

        internal_comments.slice(*ordered_ids)
      end

      def serialize_reactions(scope)
        post_reactions = Reaction.where.not(user_id: nil).where(reactable: scope)
        comment_reactions = Reaction.where.not(user_id: nil).where(reactable: Comment.where(idea: scope))
        reactions = post_reactions.chain(comment_reactions)
        serialize_records(reactions)
      end

      def serialize_followers(users)
        serialize_records(Follower.where(user: users))
      end
    end
  end
end
