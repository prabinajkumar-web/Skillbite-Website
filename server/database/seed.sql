INSERT IGNORE INTO categories (name, icon) VALUES
  ('Mathematics','📐'), ('Science','🔬'), ('Programming','💻'),
  ('Language','🗣️'), ('Engineering','⚙️'), ('Medical','🩺');

INSERT IGNORE INTO skills (category_id, name, description)
SELECT c.id, s.name, s.description FROM (
  SELECT 'Mathematics' AS cat, 'Integration' AS name, 'Integration by parts, substitution' AS description
  UNION ALL SELECT 'Mathematics','Trigonometry','Identities and equations'
  UNION ALL SELECT 'Mathematics','Calculus','Limits, derivatives, integrals'
  UNION ALL SELECT 'Science','Physics Mechanics','Newton laws, motion'
  UNION ALL SELECT 'Science','Chemistry Organic','Reactions and mechanisms'
  UNION ALL SELECT 'Science','Biology Diagrams','Neat labeled diagrams'
  UNION ALL SELECT 'Programming','Python Basics','Variables, loops, functions'
  UNION ALL SELECT 'Programming','Debugging','Fix errors in your code'
  UNION ALL SELECT 'Programming','Data Structures','Arrays, stacks, queues'
  UNION ALL SELECT 'Language','English Speaking','Conversation practice'
  UNION ALL SELECT 'Language','Tamil Translation','English to Tamil'
  UNION ALL SELECT 'Engineering','Circuit Analysis','KVL, KCL, Thevenin'
  UNION ALL SELECT 'Engineering','AutoCAD','2D drafting basics'
  UNION ALL SELECT 'Medical','Anatomy','Specimen and models'
  UNION ALL SELECT 'Medical','Pharmacology','Drug classes notes'
) s JOIN categories c ON c.name = s.cat;