# HausJS

HausJS is a relatively simple Node and TypeScript server-client communication app that's secure and built using modern JS development practices.

This is a solution for an interview test task by Ubiquiti Latvia.

Client part of this project can be found here: [manualmanul/WebHausJS](https://github.com/manualmanul/WebHausJS)

## General information

### Server Features

* Send/receive messages between clients
* Kick inactive users after a specified amount of time
* Handling of connection errors
* Handling of duplicate usernames
* Incoming data validation
* Logging of messages and activity
* Graceful shutdown
* Logging of messages and events

## Getting started

To set up this project on your machine, follow these instructions:

### Prerequisites

* Node.js 10.x or newer
* npm
* Web server to host the Web Client

### Installing

```shell
git clone https://github.com/manualmanul/HausJS.git
cd HausJS
npm i
node server.js
```

To adjust settings, edit included `config.json` before starting the server.

It's also recommended to use a reverse HTTPS proxy to enable secure communication and prevent MitM attacks.

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
