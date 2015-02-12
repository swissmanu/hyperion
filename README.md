# hyperion-graph

`hyperion-graph` is a wrapper around [`node-neo4j`](https://github.com/philippkueng/node-neo4j) and allows to create and modify history aware, time based [`Neo4j`](http://neo4j.com/) graphs as described in http://www.neo4j.org/graphgist?608bf0701e3306a23e77.

## Installation

```bash
npm install hyperion-graph --save
```

## Usage

```javascript
var Neo4j = require('node-neo4j')
	, Hyprion = require('hyperion-graph')
	, db = new Neo4j('http://localhost:7474')
	, adapter = new Hyperion(db);
	
adapter.insertNode(1701, 'Spaceship', {
		brand: 'Starfleet'
	}).catch(function(err) {
		console.log(err);
	});

adapter.updateNode(1701, 'Spaceship', {
		destroyed: 12
	}).catch(function(err) {
		console.log(err);
	});
```

## License
Copyright (c) 2015 Manuel Alabor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.