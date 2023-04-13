# frozen_string_literal: true

module MultiTenancy
  module Templates
    class TenantSerializer
      def initialize(tenant, serialization_params = {})
        @tenant = tenant
        @serialization_params = serialization_params
      end

      def run
        user_scope = User.where('invite_status IS NULL OR invite_status != ?', 'pending')

        models = @tenant.switch do
          {
            Area => serialize_records(Area),
            AreasInitiative => serialize_records(AreasInitiative.where(initiative: Initiative.published)),
            AreasProject => serialize_records(AreasProject),
            Basket => serialize_records(Basket),
            BasketsIdea => serialize_records(BasketsIdea.where(idea: Idea.published)),
            Comment => serialize_comments(Idea.published, Initiative.published),
            ContentBuilder::Layout => serialize_records(ContentBuilder::Layout),
            ContentBuilder::LayoutImage => serialize_records(ContentBuilder::LayoutImage),
            CustomField => serialize_records(CustomField),
            CustomFieldOption => serialize_custom_field_options,
            CustomForm => serialize_records(CustomForm),
            CustomMaps::Layer => serialize_records(CustomMaps::Layer),
            CustomMaps::LegendItem => serialize_records(CustomMaps::LegendItem),
            CustomMaps::MapConfig => serialize_records(CustomMaps::MapConfig),
            EmailCampaigns::Campaign => serialize_records(EmailCampaigns::Campaign.where(type: 'EmailCampaigns::Campaigns::Manual')),
            EmailCampaigns::UnsubscriptionToken => serialize_records(EmailCampaigns::UnsubscriptionToken.where(user: user_scope)),
            Event => serialize_records(Event),
            EventFile => serialize_records(EventFile),
            Group => serialize_records(Group.where(membership_type: 'manual')),
            GroupsPermission => serialize_records(GroupsPermission.joins(:group).merge(Group.where(membership_type: 'manual'))),
            GroupsProject => serialize_records(GroupsProject.joins(:group).merge(Group.where(membership_type: 'manual'))),
            HomePage => serialize_records(HomePage),
            Idea => serialize_records(Idea.published),
            IdeaFile => serialize_idea_files(Idea.published),
            IdeaImage => serialize_idea_images(Idea.published),
            IdeaStatus => serialize_records(IdeaStatus),
            IdeasPhase => serialize_ideas_phases(Idea.published),
            IdeasTopic => serialize_ideas_topics(Idea.published),
            Initiative => serialize_records(Initiative.published),
            InitiativeFile => serialize_initiative_files(Initiative.published),
            InitiativeImage => serialize_initiative_images(Initiative.published),
            InitiativeStatus => serialize_records(InitiativeStatus),
            InitiativesTopic => serialize_initiatives_topics(Initiative.published),
            Membership => serialize_records(Membership.where(user: user_scope)),
            NavBarItem => serialize_records(NavBarItem),
            OfficialFeedback => serialize_records(OfficialFeedback.where(post: Idea.published)).merge!(serialize_records(OfficialFeedback.where(post: Initiative.published))),
            Permission => serialize_records(Permission),
            Phase => serialize_records(Phase),
            PhaseFile => serialize_records(PhaseFile),
            Polls::Option => serialize_records(Polls::Option),
            Polls::Question => serialize_records(Polls::Question),
            Polls::Response => serialize_records(Polls::Response),
            Polls::ResponseOption => serialize_records(Polls::ResponseOption),
            Project => serialize_records(Project),
            ProjectFile => serialize_records(ProjectFile),
            ProjectFolders::File => serialize_records(ProjectFolders::File),
            ProjectFolders::Image => serialize_records(ProjectFolders::Image),
            ProjectFolders::Folder => serialize_records(ProjectFolders::Folder),
            ProjectImage => serialize_records(ProjectImage),
            ProjectsAllowedInputTopic => serialize_records(ProjectsAllowedInputTopic),
            StaticPage => serialize_records(StaticPage),
            StaticPageFile => serialize_records(StaticPageFile),
            TextImage => serialize_text_images,
            Topic => serialize_records(Topic),
            User => serialize_records(user_scope),
            Volunteering::Cause => serialize_records(Volunteering::Cause),
            Volunteering::Volunteer => serialize_records(Volunteering::Volunteer),
            Vote => serialize_votes(Idea.published).merge!(serialize_votes(Initiative.published)),
            AdminPublication => serialize_admin_publications(AdminPublication)
          }
        end

        models = sort_by_references(models)
        resolve_references!(models)
        { 'models' => models }
      end

      def self.format_for_tenant_template_service!(template)
        models = template['models']
        models.transform_keys! { |record_class| record_class.name.snakecase }
        models.transform_values!(&:values)
        models.deep_transform_keys!(&:to_s)
      end

      private

      def sort_by_references(models)
        ref_dependencies_graph = extract_referential_dependencies(models)
        ref_dependencies_graph[User] << CustomField if ref_dependencies_graph.key?(CustomField)

        each_node = lambda { |&b| ref_dependencies_graph.each_key(&b) }
        each_child = lambda { |n, &b| ref_dependencies_graph[n].each(&b) }

        sorted_classes = TSort.tsort(each_node, each_child)
        models.slice(*sorted_classes)
      end

      def extract_referential_dependencies(models)
        models.transform_values do |records|
          records.flat_map do |_id, attributes|
            attributes.values.filter do |value|
              value.is_a?(Serializers::Core::Ref) && value.id
            end.map(&:klass)
          end.uniq
        end
      end

      def serialize_idea_files(ideas_scope)
        idea_files = IdeaFile.joins(:idea).merge(ideas_scope)
        serialize_records(idea_files)
      end

      def serialize_idea_images(ideas_scope)
        idea_images = IdeaImage.joins(:idea).merge(ideas_scope)
        serialize_records(idea_images)
      end

      def serialize_ideas_phases(ideas_scope)
        idea_phases = IdeasPhase.joins(:idea).merge(ideas_scope)
        serialize_records(idea_phases)
      end

      def serialize_ideas_topics(ideas_scope)
        ideas_topics = IdeasTopic.joins(:idea).merge(ideas_scope)
        serialize_records(ideas_topics)
      end

      def serialize_initiative_files(initiatives_scope)
        initiative_files = InitiativeFile.joins(:initiative).merge(initiatives_scope)
        serialize_records(initiative_files)
      end

      def serialize_initiative_images(initiatives_scope)
        initiative_images = InitiativeImage.joins(:initiative).merge(initiatives_scope)
        serialize_records(initiative_images)
      end

      def serialize_initiatives_topics(initiatives_scope)
        initiatives_topics = InitiativesTopic.joins(:initiative).merge(initiatives_scope)
        serialize_records(initiatives_topics)
      end

      def serialize_baskets_ideas
        serializer = MultiTenancy::Templates::Serializers::BasketsIdea.new(*@serialization_params)
        BasketsIdea.joins(:idea).merge(Idea.published).to_h do |baskets_idea|
          [baskets_idea.id, serializer.serialize(baskets_idea)]
        end
      end

      def serialize_custom_field_options
        options = CustomFieldOption.joins(:custom_field).merge(CustomField.where.not(code: 'domicile'))
        serialize_records(options)
      end

      def serialize_votes(post_scope)
        post_votes = Vote.where.not(user_id: nil).where(votable: post_scope)
        comment_votes = Vote.where.not(user_id: nil).where(votable: Comment.where(post: post_scope))
        votes = post_votes.chain(comment_votes)
        serialize_records(votes)
      end

      def serialize_text_images
        imageable_scopes = [
          CustomField,
          Event,
          Idea.published,
          Initiative.published,
          Phase,
          Project,
          StaticPage,
          EmailCampaigns::Campaign.where(type: 'EmailCampaigns::Campaigns::Manual')
        ]

        imageable_scopes.each_with_object({}) do |scope, hash|
          hash.merge(serialize_records(TextImage.where(imageable: scope)))
        end
      end

      def serialize_records(scope)
        scope = scope.all if scope.is_a?(Class)
        record_class = infer_scope_class(scope)

        return {} if record_class.nil? && scope.size == 0

        serializer_class = MultiTenancy::Templates::Serializers.const_get(record_class.name)
        serializer = serializer_class.new(@serialization_params)
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
        publications = serialize_records(scope)

        child_to_parent = publications.transform_values do |attributes|
          Array.wrap(attributes[:parent_ref]&.id)
        end

        each_node = lambda {|&b| child_to_parent.each_key(&b) }
        each_child = lambda {|n, &b| child_to_parent[n].each(&b) }
        ordered_ids = TSort.tsort(each_node, each_child)

        publications.slice(*ordered_ids)
      end

      def serialize_comments(*post_scopes)
        comments = post_scopes.each_with_object({}) do |scope, hash|
          hash.merge!(serialize_records(Comment.where(post: scope)))
        end

        child_to_parent = comments.transform_values do |attributes|
          Array.wrap(attributes[:parent_ref]&.id)
        end

        each_node = lambda {|&b| child_to_parent.each_key(&b) }
        each_child = lambda {|n, &b| child_to_parent[n].each(&b) }
        ordered_ids = TSort.tsort(each_node, each_child)

        comments.slice(*ordered_ids)
      end

      def resolve_references!(models)
        models.each do |_record_class, instances|
          instances.each do |_identifier, serialized_instance|
            serialized_instance.transform_values! { |value| value.dereference(models) }
          end
        end
      end
    end
  end
end
