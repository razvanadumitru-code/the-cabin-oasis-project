import sqlite3

try:
    conn = sqlite3.connect('cabin_oasis.db')
    cursor = conn.cursor()

    # Migrate users to staff
    cursor.execute("""
        INSERT OR IGNORE INTO staff (first_name, last_name, email, phone, password_hash, role, is_active, created_at, updated_at)
        SELECT name, '', email, phone, password_hash, 'admin', is_active, created_at, updated_at
        FROM users
    """)

    conn.commit()
    print("Migration completed successfully")

    # Optional: delete from users after migration
    # cursor.execute("DELETE FROM users")
    # conn.commit()
    # print("Users deleted from users table")

except Exception as e:
    print(f"Error during migration: {e}")

finally:
    if 'conn' in locals():
        conn.close()
