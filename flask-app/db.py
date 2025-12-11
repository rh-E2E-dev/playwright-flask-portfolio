import sqlite3
from contextlib import closing

DB_NAME = "tasks.db"

def get_connection():
    return sqlite3.connect(DB_NAME)

def init_db():
    with closing(get_connection()) as conn:
        c = conn.cursor()

        # tasks テーブル：user_id を追加
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                done INTEGER NOT NULL DEFAULT 0,
                user_id INTEGER
            );
            """
        )

        # users テーブル
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
            """
        )

        # testuser を初回だけ投入
        def ensure_user(username, password):
            c.execute("SELECT COUNT(*) FROM users WHERE username = ?", (username,))
            if c.fetchone()[0] == 0:
                c.execute(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    (username, password)
                )

        # 追加処理
        ensure_user("test1", "pass123")
        ensure_user("テスト2", "pass456")
        ensure_user("test3", "pass123")
        ensure_user("test4", "pass123")
        ensure_user("test5", "pass123")
        ensure_user("test6", "pass123")
        ensure_user("test7", "pass123")
        ensure_user("test8", "pass123")
        ensure_user("test9", "pass123")
        ensure_user("test10", "pass123")
        ensure_user("test11", "pass123")

        conn.commit()


# -------------------------
# ユーザーごとの一覧取得
# -------------------------
def fetch_all_by_user(user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "SELECT id, title, done FROM tasks WHERE user_id = ? ORDER BY id DESC",
            (user_id,)
        )
        return c.fetchall()


# -------------------------
# INSERT
# -------------------------
def add_task(title, user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO tasks (title, user_id) VALUES (?, ?)",
            (title, user_id)
        )
        conn.commit()


# -------------------------
# 1件取得（他人のタスクは取れない）
# -------------------------
def get_task(task_id, user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "SELECT id, title, done FROM tasks WHERE id = ? AND user_id = ?",
            (task_id, user_id)
        )
        return c.fetchone()


# -------------------------
# UPDATE
# -------------------------
def update_task(task_id, title, done, user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "UPDATE tasks SET title = ?, done = ? WHERE id = ? AND user_id = ?",
            (title, done, task_id, user_id)
        )
        conn.commit()


# -------------------------
# DELETE
# -------------------------
def delete_task(task_id, user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            (task_id, user_id)
        )
        conn.commit()


# -------------------------
# ユーザーごとのタスク総数を返す
# -------------------------
def count_tasks_by_user(user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM tasks WHERE user_id = ?", (user_id,))
        return c.fetchone()[0]

# -------------------------
# 完了済みタスク数
# -------------------------
def count_done_tasks_by_user(user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND done = 1", (user_id,))
        return c.fetchone()[0]



def clear_tasks_for_user(user_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM tasks WHERE user_id = ?", (user_id,))
        conn.commit()

def create_tasks_for_user(user_id, total, done):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        for i in range(total):
            is_done = 1 if i < done else 0
            c.execute(
                "INSERT INTO tasks (title, done, user_id) VALUES (?, ?, ?)",
                (f"task-{i}", is_done, user_id)
            )
        conn.commit()
