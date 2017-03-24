const Sqlite3 = require('sqlite3').verbose();
const Bcrypt = require('bcrypt');

const Db = new Sqlite3.Database('blog.db');
Db.serialize(() => {
    // create user table
    Db.run('CREATE TABLE if not exists Users (id INTEGER PRIMARY KEY  AUTOINCREMENT, username TEXT, password TEXT, postId INTEGER, createdAt TEXT, updatedAt TEXT)');

    let inseartUserStmt = Db.prepare('INSERT INTO Users VALUES (?, ?, ?, ?, ?, ?)');
    const hash = Bcrypt.hashSync('test', 10);
    inseartUserStmt.run(1, 'vic', hash, 1, new Date().toISOString(), new Date().toISOString());
    inseartUserStmt.finalize();

    Db.each('SELECT * FROM Users', (err, row) => {
        console.log(row);
    });


    // create post table
    Db.run('CREATE TABLE if not exists posts (id INTEGER PRIMARY KEY  AUTOINCREMENT, content TEXT, userId INTEGER, createdAt TEXT, updatedAt TEXT)');

    let inseartPostStmt = Db.prepare('INSERT INTO posts VALUES (?, ?, ?, ?, ?)');
    inseartPostStmt.run(1, 'vic\'s blog', 1, new Date().toISOString(), new Date().toISOString());
    inseartPostStmt.finalize();

    Db.each('SELECT * FROM posts', (err, row) => {
        console.log(row);
    });


    // create comment table
    Db.run('CREATE TABLE if not exists comments (id INTEGER PRIMARY KEY  AUTOINCREMENT, content TEXT, userId INTEGER, postId INTEGER, createdAt TEXT, updatedAt TEXT)');

    let inseartCommentStmt = Db.prepare('INSERT INTO comments VALUES (?, ?, ?, ?, ?, ?)');
    inseartCommentStmt.run(1, 'vic\'s comment' , 1, 1, new Date().toISOString(), new Date().toISOString());
    inseartCommentStmt.finalize();

    Db.each('SELECT * FROM comments', (err, row) => {
        console.log(row);
    });

});

Db.close();
