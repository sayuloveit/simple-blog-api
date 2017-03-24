const Server = require('./index');

Server((error, server) => {
    if (error) {
        console.error(error);
    }

    server.start((err) => {
        if (err) {
            console.error(err);
        }

        console.log('Server started at: ', server.info.uri);
    });
});
