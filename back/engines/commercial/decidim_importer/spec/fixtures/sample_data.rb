# frozen_string_literal: true

module DecidimImporter
  # Synthetic Decidim rows for the one pipeline piece with no real CSV fixture: participatory-process
  # *user roles*. Real exports don't ship a roles CSV (and {ExportReader} doesn't read one), so
  # {Extractors::ProcessRolesExtractor} + {RoleAssigner} are exercised only here. Projects, phases and
  # folders have real fixtures under `decidim_export/`, covered by their own specs — just enough of a
  # project + user is included below for a moderator role to attach to.
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
          'participatory_process_group' => '',
          'published_at' => '2021-01-01', 'created_at' => '2021-01-01', 'updated_at' => '2021-01-01' }
      ]
    end

    def process_roles
      [
        { 'decidim_user' => 'decidim-user-2',
          'decidim_participatory_process' => 'decidim-participatoryprocess-100',
          'role' => 'admin' }
      ]
    end

    def all
      { users: users, projects: projects, process_roles: process_roles }
    end
  end
end
