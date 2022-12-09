SELECT id, title_multiloc, color FROM idea_statuses

UNION ALL

SELECT id, title_multiloc, color FROM initiative_statuses;
