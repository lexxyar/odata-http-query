# @lexxsoft/odata-http-query

![GitHub package.json version](https://img.shields.io/github/package-json/v/lexxyar/lexx-odata-query-builder)
![GitHub](https://img.shields.io/github/license/lexxyar/lexx-odata-query-builder)
![GitHub all releases](https://img.shields.io/github/downloads/lexxyar/lexx-odata-query-builder/total)

# Contents

* [Installation](#installation)
* [Usage](#usage)
* [Basic usage](#basic-usage)
    * [Ordering](#ordering)
    * [Expanding](#expanding)
    * [Limiting](#limiting)
    * [Paging](#paging)
    * [Filtering](#filtering)
    * [ID](#id)
    * [Select](#select)
    * [Count](#count)
    * [Search](#search)
    * [File content](#file-content)

# Installation

```shell script
npm i @lexxsoft/odata-http-query
```

# Usage

## Basic usage

```typescript
const o: QueryBuilder = new QueryBuilder()
```

or

```typescript
const o: QueryBuilder = QueryBuilder.make()
```

Or create with flow

```typescript
const o: string = QueryBuilder.make()
    .querySet('lang', 'en')
    .toString()
```

> Output `lang=en`

## Configuration

QueryBuilder has configuration to customize process.

### Markers

QueryBuilder has markers to customize fixed query params. Type for markers shown below:

```typescript
type TQueryMarkers = {
    select: string[] | string,
    limit: string[] | string,
    offset: string[] | string,
    order: string[] | string,
    expand: string[] | string,
    search: string[] | string,
    count: string[] | string,
    filter: string[] | string,
}
```

### Markers and corresponding query field

By default, QueryBuilder markers are correspond to OData query field.

```typescript
const DefaultQueryMarkers: TQueryMarkers = {
    limit: ['$top', '$limit'],
    offset: ['$skip', '$offset'],
    order: ['$orderby', '$order'],
    expand: '$expand',
    select: '$select',
    filter: '$filter',
    count: '$count',
    search: '$search',
}
```

Of course, you can customize there names as you need.
For flexibility each marker could have alias. Pass them as array to defaults for correct work. Look at example above.

### Custom configuration

QueryBuilder configuration type:

```typescript
type TQueryBuilderDefaults = {
    limit?: number,
    markers?: TQueryMarkers,
}
```

| Field   | Type          | Default               | Description                                               |
|---------|---------------|-----------------------|-----------------------------------------------------------|
| limit   | Number        | `undefined`           | Set `limit` to use limitation for every builder instance. |
| markers | TQueryMarkers | `DefaultQueryMarkers` | Set custom query field name for every marker              |











### Ordering

Use `order` method to add order query parameters
> Note: `order` method has an alias `orderby`

```js
const o = new QueryBuilder('/users')
o.order(new QueryOrder('name1')).toString()
```

> Output `/users?$orderby=name1 asc`

Also, you can combine several order conditions

```js
const o = new QueryBuilder('/users')
o.order(new QueryOrder('name1')).order(new QueryOrder('name2', QueryOrderDirection.DESC))
o.toString()
```

> Output `/users?$orderby=name1 asc,name2 desc`

### Expanding

Use `expand` method to add expand query parameter

```js
const o = new QueryBuilder('/users')
o.expand('company').toString()
```

> Output `/users?$expand=company`

Or combine several expand parameters

```js
const o = new QueryBuilder('/users')
o.expand('company').expand('jobtitle').toString()
```

> Output `/users?$expand=company,jobtitle`

To add counter to expanding parameter, add `true` as second parameter of `expand` method

```js
const o = new QueryBuilder('/users')
o.expand('emails', true).toString()
```

> Output `/users?$expand=company($count=true)`

### Limiting

For limiting returned data, use `limit` and `offset` methods
> Note: `limit` has an alias `top`
> `offset` has aliases `skip` and `shift`

```js
const o = new QueryBuilder('/users')
o.top(7).skip(4).toString()
```

> Output `/users?$top=7&$skip=4`

### Paging

To limit output data by page, use `page` method.

```js
const o = new QueryBuilder('/users')
o.page(3).toString()
```

> Output `/users?$top=10&$skip=20`

By default, it has 10 records per page, but you free to change in via QueryBuilder configuration.

```js
const o = new QueryBuilder('/users', {rowsPerPage: 5})
o.page(3).toString()
```

> Output `/users?$top=5&$skip=10`

### Filtering

Use `filter` method to add constrains. QueryBuilder accept only **one** filter, but you free to use `and` and `or`
methods of QueryFilter to combine them together.

```js
const oFilter = new QueryFilter('gender', 'f')
oFilter.and('age', 16, QueryFilterSign.GT)
const o = new QueryBuilder('/users')
o.filter(oFilter).toString()
```

> Output `/users?$filter=gender eq f and age gt 16`

#### Filter operations

- [X] EQ
- [X] GT
- [X] GE
- [X] LT
- [X] LE
- [ ] NE
- [X] SUBSTRINGOF
- [X] STARTSWITH
- [X] ENDSWITH

### Counting

`count` method will add `$count` suffix to url

```js
const o = new QueryBuilder('/users')
o.count().toString()
```

> Output `/users/$count`

Of course, you can use `count` with `filter` for example.

```js
const oFilter = new QueryFilter('gender', 'f')
oFilter.and('age', 16, QueryFilterSign.GT)
const o = new QueryBuilder('/users')
o.filter(oFilter).count().toString()
```

> Output `/users/$count?$filter=gender eq f and age gt 16`

### ID

ID is primary key of database. Use `id` method to create oData request for single entity.

```js
const o = new QueryBuilder('/users')
o.id(4).toString()
```

> Output `/users(4)`

### Select

Use `select` method to constrain returned fields

```js
const o = new QueryBuilder('/users')
o.select(['id', 'name']).toString()
```

> Output `/users?$select=id,name`

### Count

Use `count` method to get request for count value

```js
const o = new QueryBuilder('/users')
o.count()
```

> Output `/users/$count

Other-hand, if you want to make request of data with total count, you can use `inlineCount` method
Use `count` method to get request for count value

```js
const o = new QueryBuilder('/users')
o.inlineCount()
```

> Output `/users?$count=true

### search

Free-text search parameter, which was added for OData v4.0

```js
const o = new QueryBuilder('/users')
o.search('John Doe')
```

> Output `/users?$search=John Doe

### File content

Getting the file content is extra path. It will not make effect to real oData server, but you can use it in
development as ideology.

#### File content as-is

To get file content, call `asFileContent` method

```js
const o = new QueryBuilder('/files')
o.id(4).asFileContent().toString()
```

> Output `/files(4)/_file`

#### Base64 encoded content

Sometimes needed to get base64 encoded content. Use `asFileContentBase64` method to generate path

```js
const o = new QueryBuilder('/files')
o.id(4).asFileContentBase64().toString()
```

> Output `/files(4)/_file64`

# Parsing URL

For case if you already have url, and you want to add or change some parameter, you may use `parse` method, to parse url
and get instance of QueryBuilder

```js
const o = QueryBuilder.parse(`/employee`)
consle.log(o.toString())
```

> Output `/employee`

Or, if you use full url

```js
const o = QueryBuilder.parse(`http://site.com/api/users`)
consle.log(o.toString())
```

> Output `/users`

Output is short, because `parse` method get only script path. To get full url, add `true` as second parameter, to tell
parser save url as is

```js
const o = QueryBuilder.parse(`http://site.com/api/users`)
consle.log(o.toString())
```

> Output `http://site.com/api/users`

Of-cause, you can use this method to parse url with query

```js
const o = QueryBuilder.parse(`/users?$count=true`)
consle.log(o.toString())
```

> Output `/users?$count=true`
