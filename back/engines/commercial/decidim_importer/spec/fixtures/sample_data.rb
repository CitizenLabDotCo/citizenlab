# frozen_string_literal: true

module DecidimImporter
  # Synthetic Decidim rows for the one pipeline piece with no self-contained real fixture: participatory-
  # process *user roles* (the per-process `NN---users.csv`, read by {ExportReader} and stamped with the
  # process uid). {Extractors::ProcessRolesExtractor} + {ModeratorAssigner} are exercised end-to-end here.
  # Projects, phases and folders have real fixtures under `decidim_export/`, covered by their own specs —
  # just enough of a project + user is included below for a moderator role to attach to.
  module SampleData
    module_function

    def users
      [
        { 'uid' => 'decidim-user-2', 'name' => 'Henri Dupont', 'email' => 'henri@example.fr',
          'confirmed_at' => '2020-02-01 10:00', 'locale' => 'fr',
          'admin' => 'false', 'created_at' => '2020-02-01 10:00',
          'extended_data' => '{"gender":"male"}' }
      ]
    end

    def projects
      [
        { 'uid' => 'decidim-participatoryprocess-100', 'title' => 'Budget participatif 2021',
          'description' => '<p>Proposez vos projets.</p>',
          'short_description' => 'Le budget participatif annuel', 'hero_image' => '',
          'participatory_process_group' => '', 'url' => 'https://decidim.example/processes/budget-participatif-2021',
          'published_at' => '2021-01-01', 'created_at' => '2021-01-01', 'updated_at' => '2021-01-01' }
      ]
    end

    # As {ExportReader} yields them: the per-process `users.csv` columns (`uid`, `role`) stamped with the
    # owning process uid. The `admin` becomes a moderator; `private_user` is a private-space participant,
    # ignored.
    def process_roles
      [
        { 'uid' => 'decidim-user-2', 'role' => 'admin',
          'decidim_participatory_process' => 'decidim-participatoryprocess-100' },
        { 'uid' => 'decidim-user-2', 'role' => 'private_user',
          'decidim_participatory_process' => 'decidim-participatoryprocess-100' }
      ]
    end

    def all
      { users: users, projects: projects, process_roles: process_roles }
    end
  end
end
