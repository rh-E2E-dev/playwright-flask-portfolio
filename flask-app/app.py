from flask import Flask, render_template, request, redirect, url_for
import db
# flask --app app run

app = Flask(__name__)

# アプリ起動時にDBを作る
db.init_db()

@app.route("/")
def index():
    tasks = db.fetch_all()
    return render_template("index.html", tasks=tasks)


@app.route("/new", methods=["GET", "POST"])
def new():
    if request.method == "POST":
        title = request.form.get("title")
        if title:
            db.add_task(title)
        return redirect(url_for("index"))
    return render_template("new.html")


@app.route("/edit/<int:task_id>", methods=["GET", "POST"])
def edit(task_id):
    task = db.get_task(task_id)
    if not task:
        return "Not found", 404

    if request.method == "POST":
        title = request.form.get("title")
        done = 1 if request.form.get("done") == "on" else 0
        db.update_task(task_id, title, done)
        return redirect(url_for("index"))

    return render_template("edit.html", task=task)


@app.route("/delete/<int:task_id>")
def delete(task_id):
    db.delete_task(task_id)
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True, port=5100)