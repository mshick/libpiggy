# libpiggy [![Build Status](https://travis-ci.org/mshick/libpiggy.svg?branch=master)](https://travis-ci.org/mshick/libpiggy) [![npm version](https://badge.fury.io/js/libpiggy.svg)](https://badge.fury.io/js/libpiggy)
Use a PostgreSQL database like a JSON document store.

## Why?

On the surface using a relational database as a JSON document store might seem silly. Still, I think there are great reasons to choose this approach over something like Mongo.

* You like PostgreSQL
* Postgres JSON querying and indexing is powerful and capable
* You like the option of using PostgreSQL queries, in addition to some of the more ORM-like abstractions incorporated here
* You like the idea of prototyping data objects with the flexibility of schema-less JSON, but imagine yourself making changes to a more relational model in the future
* For some reason you only have access to PostgreSQL, but prefer this approach
* You like the `watchTable` functionality, and being able to create an easy, lightweight reactive database

## Documentation

For now please look at the tests, and at the [hapi-piggy](https://github.com/mshick/hapi-piggy) module which implements this.

## Testing

You'll need Docker and docker-compose available.

```sh
$ docker-compose up
$ npm test
```

## Requirements

* Node.js >= 6.0
* PostgreSQL >= 9.5 (local tests use 9.6, Travis uses 9.5)

## Todo

* Documentation
* Support nested btree indexes
* Proper tests
