# HausJS

HausJS is a relatively simple Node and TypeScript server-client communication app that's secure and built using modern JS development practices.

## General information

### Server Features

* Send/receive messages between clients
* Handling of connection errors
* User authentication
* Moderation tools (kick, ban by IP)
* Rate limiting
* Incoming data validation
* Logging of messages and activity

### Web Client features

* Landing page and chat page
* HTML5 notifications and sound effects for mentions
* Feedback messages (server unavailable, nickname taken etc.)
* Keepalive system

### Demonstration

You can find a demonstration server here: [hausjs.catto.io](https://hausjs.catto.io)

Please note that this server is unmoderated and accessible to everyone. I've added bot users Ian and Karen that send messages between each other for demonstration purposes.

## Getting started

To set up this project on your machine, follow these instructions:

### Prerequisites

* Node.js 12.x or newer
* npm
* Web server to host the Web Client

### Installing

```shell
git clone https://github.com/manualmanul/HausJS.git
cd HausJS
node server.js
```

By default the server will run with no user priviledge system or any rate limiting. Logs are output to stdout.

To adjust settings, edit the included `config.js` file before starting the server.

### Web Client installation

Copy the included WebClient directory to a web server accessible to your clients over HTTPS.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Added some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
