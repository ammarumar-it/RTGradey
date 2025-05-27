-- Create function to update rubric usage count
CREATE OR REPLACE FUNCTION update_rubric_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rubrics
    SET usage_count = usage_count + 1
    WHERE id = NEW.rubric_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rubrics
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.rubric_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignments table
DROP TRIGGER IF EXISTS update_rubric_usage_count_trigger ON assignments;
CREATE TRIGGER update_rubric_usage_count_trigger
AFTER INSERT OR DELETE ON assignments
FOR EACH ROW
EXECUTE FUNCTION update_rubric_usage_count();

-- Create function to update user settings on user creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO analytics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS create_user_settings_trigger ON users;
CREATE TRIGGER create_user_settings_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_settings();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_classrooms_timestamp ON classrooms;
CREATE TRIGGER update_classrooms_timestamp
BEFORE UPDATE ON classrooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_rubrics_timestamp ON rubrics;
CREATE TRIGGER update_rubrics_timestamp
BEFORE UPDATE ON rubrics
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_rubric_criteria_timestamp ON rubric_criteria;
CREATE TRIGGER update_rubric_criteria_timestamp
BEFORE UPDATE ON rubric_criteria
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_assignments_timestamp ON assignments;
CREATE TRIGGER update_assignments_timestamp
BEFORE UPDATE ON assignments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_graded_essays_timestamp ON graded_essays;
CREATE TRIGGER update_graded_essays_timestamp
BEFORE UPDATE ON graded_essays
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_feedback_comments_timestamp ON feedback_comments;
CREATE TRIGGER update_feedback_comments_timestamp
BEFORE UPDATE ON feedback_comments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_analytics_timestamp ON analytics;
CREATE TRIGGER update_analytics_timestamp
BEFORE UPDATE ON analytics
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_settings_timestamp ON settings;
CREATE TRIGGER update_settings_timestamp
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
