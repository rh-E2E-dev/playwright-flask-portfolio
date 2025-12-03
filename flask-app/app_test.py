from flask import Flask, request, redirect, url_for, render_template
# flask --app hello run

app = Flask(__name__)

@app.route('/')
def index():
    who = request.args.get('name')
    password = request.args.get('pass')
    if who and password:
        return render_template('index.html', name = who)
    else:
        return render_template('index.html')
    
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/post_test')
def post_test():
    return render_template('post_test.html')

@app.route('/post_get', methods=['POST'])
def post_get():
    username = request.form.get('name')
    postword = request.form.get('post')
    return render_template('post_get.html', n=username, p=postword)

if __name__ == "__main__":
    app.run(debug=True)