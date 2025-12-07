from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    UserMixin,
    current_user,
)
import db
import sqlite3

app = Flask(__name__)
app.secret_key = "secret"  # 最低限のセッション用キー

db.init_db()

# -----------------------------
# Flask-Login セットアップ
# -----------------------------
login_manager = LoginManager()
login_manager.login_view = "login"  # 未ログイン時に飛ばす先
login_manager.init_app(app)


# -----------------------------
# User クラス
# -----------------------------
class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username


# -----------------------------
# user_loader：IDからユーザーを復元
# -----------------------------
@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect("tasks.db")
    c = conn.cursor()
    c.execute("SELECT id, username FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return User(row[0], row[1])
    return None


# -----------------------------
# ログイン
# -----------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            return render_template(
                "login.html", 
                error="ユーザー名とパスワードを入力してください"
            )

        conn = sqlite3.connect("tasks.db")
        c = conn.cursor()
        c.execute(
            "SELECT id, username FROM users WHERE username = ? AND password = ?",
            (username, password),
        )
        row = c.fetchone()
        conn.close()

        if row:
            user = User(row[0], row[1])
            login_user(user)
            return redirect(url_for("index"))
        else:
            return render_template("login.html", error="ログインに失敗しました")

    return render_template("login.html")


# -----------------------------
# ログアウト
# -----------------------------
@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


# -----------------------------
# タスク一覧（認証必須）
# -----------------------------
@app.route("/")
@login_required
def index():
    tasks = db.fetch_all_by_user(current_user.id)
    return render_template("index.html", tasks=tasks)


# -----------------------------
# タスク作成（認証必須）
# -----------------------------
@app.route("/new", methods=["GET", "POST"])
@login_required
def new():
    if request.method == "POST":
        title = request.form.get("title")
        if title:
            db.add_task(title, current_user.id)
        return redirect(url_for("index"))
    return render_template("new.html")


# -----------------------------
# タスク編集（認証必須）
# -----------------------------
@app.route("/edit/<int:task_id>", methods=["GET", "POST"])
@login_required
def edit(task_id):
    task = db.get_task(task_id, current_user.id)
    if not task:
        return "Not found", 404

    if request.method == "POST":
        title = request.form.get("title")
        done = 1 if request.form.get("done") == "on" else 0
        db.update_task(task_id, title, done, current_user.id)
        return redirect(url_for("index"))

    return render_template("edit.html", task=task)


# -----------------------------
# タスク編集（認証必須）_IDなしの場合リダイレクト
# -----------------------------
@app.route("/edit")
def edit_no_id():
    if not current_user.is_authenticated:
        return redirect(url_for("login"))
    return redirect(url_for("index"))


# -----------------------------
# タスク削除（認証必須）
# -----------------------------
@app.route("/delete/<int:task_id>")
@login_required
def delete(task_id):
    db.delete_task(task_id, current_user.id)
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True, port=5100)


# -----------------------------
# タスク削除（認証必須）_IDなしの場合リダイレクト
# -----------------------------
@app.route("/delete")
def delete_no_id():
    if not current_user.is_authenticated:
        return redirect(url_for("login"))
    return redirect(url_for("index"))


# -----------------------------
# マイページ
# -----------------------------
@app.route("/mypage")
@login_required
def mypage():
    return render_template("mypage.html")


# -----------------------------
# API：Stats
# -----------------------------
@app.route("/api/stats")
@login_required
def api_stats():
    user_id = current_user.id

    total = db.count_tasks_by_user(user_id)
    done = db.count_done_tasks_by_user(user_id)

    done_rate = done / total if total > 0 else 0

    return jsonify({
        "username": current_user.username,
        "task_count": total,
        "done_rate": done_rate
    })