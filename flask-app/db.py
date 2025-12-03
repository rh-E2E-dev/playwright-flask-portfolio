# sqliteを操作するための標準ライブラリ
import sqlite3
# with文の中で「終わったら閉じる」を自動化するツール
from contextlib import closing

# このファイルがDB本体。なければ作成される。
DB_NAME = "tasks.db"

# DBに接続する。
def get_connection():
    # 返り値はconnectionオブジェクト
    return sqlite3.connect(DB_NAME)


'''
with closing(接続) as conn:
    # この中でSQLを実行する
# ここを出たら自動で接続を閉じる

普通なら：
conn = get_connection()
try:
    # SQL実行
finally:
    conn.close()
…って書くものを、
1行でスッキリ書けるようにしただけ。
'''
# 初期化（テーブルを作るフェーズ）
def init_db():
    with closing(get_connection()) as conn:
        # cursor() = SQL発行するためのペン
        # データベースに対して何か処理を実行するためにはデータベースカーソルを使用する必要があります。
        # そのため、以下のようにカーソルオブジェクトを生成します。
        c = conn.cursor()

        # Cursor#execute()メソッド = SQLを投げる
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                done INTEGER NOT NULL DEFAULT 0
            );
            """
        )

        # Cursor#commit()メソッド = DBへの反映
        conn.commit()

# SELECT（一覧取得）
def fetch_all():
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("SELECT id, title, done FROM tasks ORDER BY id DESC")
        
        # Cursor#fetchall()メソッド = すべての行をPythonのリストとして返す
        # 例：[(1, "買い物", 0), (2, "掃除", 1), …]
        return c.fetchall()

# INSERT
def add_task(title):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        '''???????????
        ここでの (title,) が初心者嫌がらせポイントだけど、
        1要素のタプルを書かなきゃいけないルール。
        '''
        conn.commit()

def get_task(task_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("SELECT id, title, done FROM tasks WHERE id = ?", (task_id,))
        return c.fetchone()

def update_task(task_id, title, done):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute(
            "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
            (title, done, task_id),
        )
        conn.commit()

def delete_task(task_id):
    with closing(get_connection()) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()