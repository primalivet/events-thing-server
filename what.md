Express server with mongodb backend for event-things.

WHY: So I can create my own servers, dbs and more at work!
NEXT: finish cleanup of controllers, new tests (and error responses) and create a new method token.verifyAdmin

exceptions

user delete and update

user should only be able to update it's own info, unless admin
user should only be albe to delete itself, unless admin

user should only be able to update it's own info, unless admin
user should only be albe to delete itself, unless admin

common response object

```js
// Response with multiple items
{
  message: String,
  items: Array of Object,
  meta: {
    count: Number,
    offset: Number, // default 0
    limit: Number, // default 30, max 100
  }
  links: {
    self: String,
    first: String,
    last: String,
    next: String,
    prev: String,
  }
}
```
```js
// Response with single item
{
  message: String,
  item: Object,
  meta: Object,
  links: {
    self: String,
  }
}
```
```js
{
  message: String,
  error: {
    status: Number,
    message: String,
  }
}
```
