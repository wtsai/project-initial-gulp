Project Initial with gulp
------------

This repository will initial a new project witch gulp. 
It provides:

- ChatRoom example with ExpressJS 4.0, AngularJS & Bootstrap.
- Customize bootstrap with LESS.
- Install npm and Bower packages automatically.
- Development server with [BrowserSync](http://www.browsersync.io/)

## Setup

1. Git clone this [repo](https://github.com/wtsai/project-initial-gulp).
2. Install [Node.js / npm](http://nodejs.org/download/)
3. Fetch the dependencies for gulp:

        npm install

4. Install Gulp

        npm install -g gulp

5. Verify Gulp works

        gulp

## Use the Gulp Build
- Start the prodution server

        gulp start

    This will run on a local server: [http://localhost:9000](http://localhost:9000)

    Changes to any of the source files (in the `src` dir) will automatically reflash for the client: [http://localhost:3000](http://localhost:3000). 
	
    Everything will be in the `dist` directory.
	
- Cleanup

        gulp clean
