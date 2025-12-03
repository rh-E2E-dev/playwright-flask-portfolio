from flask import Flask, request, redirect, url_for
# flask --app hello run

app = Flask(__name__)

# @から始まるものをデコレータと呼ぶ。
@app.route('/')
def index():
    return 'Hello, Flask!'

# クエリを受け取る
@app.route('/pw')
def pw():
    name = request.args.get("name")
    return f"Hello, {name}! Let's study Playwright!"
    # URLとしては右記のような形になる：/pw?name=sakura

# クエリを受け取る2
@app.route("/calc")
def calc():
    a = request.args.get("a")
    b = request.args.get("b")
    if a and b:
        return f"{a} + {b} = {int(a) + int(b)}"
    else:
        return "This is Calc page."
    # URLとしては右記のような形になる：/pw?a=1&b=3

# リダイレクトする
@app.route("/redirect")
def redirect_test():
    return redirect("/")

# URLに変数を使う
@app.route("/user/<username>")
def show_user_name(username):
    return "Your name is " + username

# URLをハードコーディングせず、関数名から得る
@app.route("/redirect2")
def redirect_test2():
    return redirect(url_for("index"))

@app.route("/__name__")
def name():
    return __name__
    # python hello.pyで実行され場合は__main__となり、
    # flask --app hello runで実行された場合はhelloとなる。

if __name__ == '__main__':
    app.run(debug=True)
    print("server is running")
# __name__はimportしたモジュール名が入る
# 最初に実行した.py（モジュール）は__name__に__main__が入る
# つまり、このifブロックは、このhello.pyが、他のモジュールからインポートされた場合は実行されない。
# このファイルがコマンドラインから直接実行され場合のみ実行される。