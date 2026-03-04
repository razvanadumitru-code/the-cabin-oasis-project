from config.database import engine
from sqlalchemy import text

def check_cabins_schema():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("DESCRIBE cabins;"))
            columns = []
            print("Current cabins table schema:")
            for row in result:
                col_name = row[0]
                columns.append(col_name)
                print(f"{col_name}: {row[1]} {'NULL' if row[2] else 'NOT NULL'} {'PRIMARY KEY' if row[3] == 'PRI' else ''}")
            
            # Rename cabin_id to id if needed
            if 'cabin_id' in columns and 'id' not in columns:
                print("Renaming cabin_id to id...")
                conn.execute(text("ALTER TABLE cabins CHANGE cabin_id id INT AUTO_INCREMENT;"))
                conn.commit()
                print("Renamed cabin_id to id.")
            
            # Add missing columns
            if 'status' not in columns:
                print("Adding status column...")
                conn.execute(text("ALTER TABLE cabins ADD COLUMN status VARCHAR(50) DEFAULT 'available';"))
                conn.commit()
                print("Status column added.")
            
            if 'amenities' not in columns:
                print("Adding amenities column...")
                conn.execute(text("ALTER TABLE cabins ADD COLUMN amenities TEXT;"))
                conn.commit()
                print("Amenities column added.")
            
            print("Schema update complete.")
    except Exception as e:
        print(f"Error: {e}")

def check_staff_schema():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("DESCRIBE staff;"))
            columns = []
            print("Current staff table schema:")
            for row in result:
                col_name = row[0]
                columns.append(col_name)
                print(f"{col_name}: {row[1]} {'NULL' if row[2] else 'NOT NULL'} {'PRIMARY KEY' if row[3] == 'PRI' else ''}")
            
            # If old columns exist, migrate
            if 'first_name' in columns and 'last_name' in columns and 'full_name' not in columns:
                print("Migrating first_name and last_name to full_name...")
                # Add full_name column
                conn.execute(text("ALTER TABLE staff ADD COLUMN full_name VARCHAR(200) NOT NULL AFTER staff_id;"))
                # Update full_name
                conn.execute(text("UPDATE staff SET full_name = CONCAT(first_name, ' ', last_name);"))
                # Drop old columns
                conn.execute(text("ALTER TABLE staff DROP COLUMN first_name, DROP COLUMN last_name;"))
                conn.commit()
                print("Migrated to full_name.")
            
            # Update role to enum
            if 'role' in columns:
                print("Updating role to ENUM...")
                conn.execute(text("ALTER TABLE staff MODIFY role ENUM('admin','manager','maintenance') NOT NULL;"))
                conn.commit()
                print("Role updated to ENUM.")
            
            # Change is_active to status
            if 'is_active' in columns and 'status' not in columns:
                print("Renaming is_active to status...")
                conn.execute(text("ALTER TABLE staff CHANGE is_active status BOOLEAN DEFAULT TRUE NOT NULL;"))
                conn.commit()
                print("Renamed is_active to status.")
            
            print("Staff schema update complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_cabins_schema()
    check_staff_schema()
