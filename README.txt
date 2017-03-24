node v6.10.0
npm v3.10.10


set up:
npm install;
node setup_db.js;

start server:
npm run serve

run tests:
npm run test

docs:
http://localhost:3000/docs


curl commands:

auth:
create new user
curl -X POST -H "Cache-Control: no-cache" -F "username={username}" -F "password={password}" "http://localhost:3000/signup"

retrieve token (required for some routes):
curl -X POST -F "username={username}" -F "password={password}" "http://localhost:3000/authenticate"


posts:
get /post
curl -X GET  "http://localhost:3000/posts"

post /post
curl -X POST -H "Authorization: {token}"  -F "userId={userId}" -F "post={post content}" "http://localhost:3000/posts"

put /post/:id
curl -X PUT -H "Authorization: {token}" -F "post={new post content}" "http://localhost:3000/posts/{postId}"


comments
get /post/:id/comments
curl -X GET  "http://localhost:3000/posts/{postId}/comments"

post /post/:id/comments
— anonymous user
curl -X POST -F "comment=new comment" "http://localhost:3000/posts/{postId}/comments"
— signed in user
curl -X POST -H "Authorization: {token}"  -F "userId={userId}" -F "comment={comment content}" "http://localhost:3000/posts/{postId}/comments"

put /posts/:id/comments/id
curl -X PUT -H "Authorization: {token}"  -F "comment={new comment content}" "http://localhost:3000/posts/{postId}/comments/{commentId}"