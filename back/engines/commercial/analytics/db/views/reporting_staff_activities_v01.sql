-- Reporting view: how much management work staff did, as counts per day,
-- project, role and activity. Deliberately never says which staff member did
-- what: no user ids, names or per-person rows.
--
-- Counts only actions that staff alone can take, from the activities log the
-- admin management feed also reads. Leaves out the generic input
-- created/changed/deleted actions that feed shows: residents take them too,
-- and every status change also logs a generic 'changed'.
--
-- role is the person's highest role now, not when they acted: the platform
-- keeps no role history. Days are in the platform timezone, like the community
-- monitor scores.
WITH tracked_actions (item_type, action, activity) AS (
    VALUES
        ('Project', 'created', 'project_created'),
        ('Project', 'published', 'project_published'),
        ('Project', 'changed', 'project_changed'),
        ('Project', 'deleted', 'project_deleted'),
        ('Project', 'project_review_requested', 'project_review_requested'),
        ('Project', 'project_review_approved', 'project_review_approved'),
        ('ProjectFolders::Folder', 'created', 'folder_created'),
        ('ProjectFolders::Folder', 'changed', 'folder_changed'),
        ('ProjectFolders::Folder', 'deleted', 'folder_deleted'),
        ('Phase', 'created', 'phase_created'),
        ('Phase', 'changed', 'phase_changed'),
        ('Phase', 'deleted', 'phase_deleted'),
        ('Permission', 'changed', 'permissions_changed'),
        ('Idea', 'changed_status', 'input_status_changed'),
        ('Idea', 'changed_assignee', 'input_assigned'),
        ('OfficialFeedback', 'created', 'official_feedback_posted'),
        ('InternalComment', 'created', 'internal_comment_posted'),
        ('Comment', 'marked_as_deleted', 'comment_removed'),
        ('Moderation::ModerationStatus', 'read', 'moderation_item_marked_read')
)
SELECT
    ((a.acted_at AT TIME ZONE 'UTC') AT TIME ZONE COALESCE(
        (SELECT ac.settings -> 'core' ->> 'timezone' FROM app_configurations ac LIMIT 1),
        'UTC'
    ))::date AS activity_date,
    a.project_id,
    CASE
        WHEN u.id IS NULL THEN NULL
        WHEN u.roles @> '[{"type":"admin"}]' THEN 'admin'
        WHEN u.roles @> '[{"type":"space_moderator"}]' THEN 'space_moderator'
        WHEN u.roles @> '[{"type":"project_folder_moderator"}]' THEN 'project_folder_moderator'
        WHEN u.roles @> '[{"type":"project_moderator"}]' THEN 'project_moderator'
        ELSE 'former_staff'
    END AS role,
    -- Same rule as User.citizenlab_member, which billing uses to leave out
    -- Go Vocal's own staff.
    COALESCE(
        u.email ~* 'citizenlab\.(eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$'
        OR u.email ~* 'govocal\.(com|eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$',
        FALSE
    ) AS govocal_staff,
    t.activity,
    COUNT(*)::integer AS activity_count
FROM activities a
INNER JOIN tracked_actions t ON t.item_type = a.item_type AND t.action = a.action
LEFT JOIN users u ON u.id = a.user_id
-- An author deleting their own comment logs the same action; only a moderator
-- has to give a reason.
WHERE a.item_type <> 'Comment' OR a.payload ->> 'reason_code' IS NOT NULL
GROUP BY activity_date, a.project_id, role, govocal_staff, t.activity
