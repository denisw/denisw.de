---
tags: post
layout: post
date: 2019-04-15
title: Introducing Redux Preboiled
permalink: /p/redux-preboiled/
description: |
  A collection of simple, TypeScript-friendly Redux helpers.
---

Both at [Futurice](https://www.futurice.com/) and in my spare time, I'm
working a lot on apps based on [Redux][redux]. More often than not, the Redux
parts tend to accumulate a good amount of boilerplate code - action type
constants, action creator declarations, reducer `switch` statements with the
same `default: return state` clauses, and so on.

Some codebases have ad-hoc helper functions to reduce the noise, but those are
often sparsely documented and not general-purpose enough for reuse across
projects. It would be nice if there was an existing library of well-maintained
Redux helpers that our projects could rely on instead. However, whenever I
looked for such a library, I didn't find anything quite matching my
requirements.

Basically, I've been looking for a *"[Lodash][lodash] for Redux"* - a
collection of simple, stand-alone helper functions that I can pick and choose
from based on my project's needs, as opposed to an all-in-one framework like
[Rematch][rematch] (which is nice, but too opinionated to fit every use case).
These helpers need to work well with [TypeScript][typescript] as my work
increasingly relies on it - a requirement that a lot of Redux libraries, many
of which pre-date TypeScript, struggle with. Lastly, I generally want to avoid
the mental overhead of introducing new concepts like [models and
entities][redux-orm]; in most cases, I just need some conveniences on top of
the existing Redux concepts.

As I couldn't find an existing solution, I started creating my own. I am happy
to announce that I have recently released the result of this effort as **Redux
Preboiled**.

## TypeScript-friendly Redux helpers, served _á la carte_

[Redux Preboiled][redux-preboiled] is a library of boilerplate-reducing Redux
helper functions, designed to fit together nicely while still being usable
individually. It is written in and optimized for TypeScript, while still being
a good fit for pure-JavaScript apps. A major goal for Preboiled is simplicity -
no fancy new concepts, no reliance on clever "magic" to shave off a few more
lines at the expense of understandability, but just small and straight-forward
functions that can be easily composed to do greater things.

Let's look an example - in fact, let's look at the example of all examples in
the Redux world, good old [counter][redux-counter]. For extra excitement,
we're going to throw in a parameterized `multiply` action to complement
`increment`. Here is how you might write this in vanilla Redux, assuming you
follow the patterns recommended in the Redux documentation:

```js
// Action Types

const INCREMENT = 'increment'
const MULTIPLY = 'multiply'

// Action Creators

const increment = () => ({
  type: INCREMENT
})

const multiply = amount => ({
  type: MULTIPLY,
  payload: amount
})

// Reducer

const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1
    case MULTIPLY:
      return state * action.payload
    default:
      return state
  }
}
```

This is far from terrible, but there is already some fluff here. Note how we
had to write _two_ declarations for type of action - an action type constant
and a corresponding action creator function. This approach has [several
benefits][redux-actions-boilerplate], of course, but it's still cumbersome.
Also, for every other reducer like `counterReducer`, we'll need to repeat the
`switch (action.type) { … }` ceremony and make sure not to forget the
`default: return state` clause at the end.

With Redux Preboiled, you could write this instead:

```js
import {
  chainReducers,
  createAction,
  onAction,
  withInitialState
} from 'redux-preboiled'

// Actions

const increment = createAction('increment')
const multiply = createAction('multiply').withPayload()

// Reducer

const counterReducer = chainReducers(
  withInitialState(0),
  onAction(increment, state => state + 1),
  onAction(multiply, (state, action) => state * action.payload)
)
```

We have reduced the number of lines from 28 to 19, six of which are the import
statement. This means that, ignoring imports (which only matter so much here
because the example is so small), Preboiled helped us cut the length of the
action and reducer definitions in half, thanks to these four helpers:

* `createAction`, which generates an action creator given an action type
(optionally with a `payload` parameter) _and_ makes the action type available
as a `type` property on that action creator (e.g., `increment.type`), making a
separate action type constant unnecessary;

* `onAction` and `withInitialState`, which let you create sub-reducers that
handle specific action types or provide an initial state, respectively;

* and `chainReducers`, which pulls our sub-reducers together by arranging them
to a pipeline (or "call chain").

As can be seen above, these helpers are designed to fit well with each other.
For example, `onAction` allowed us to specify the action type by passing one
of the action creators we generated with `createAction` (e.g., `increment`),
instead of having to explicitly pass the corresponding action type
(`increment.type` or `'increment'`). The latter option is also available - and
makes `onAction` usable stand-alone - but the former offers additional
convenience if you use both helpers together.

## Goes well with TypeScript

From the start, Redux Preboiled was designed with TypeScript in mind. The
helpers' function signatures lend themselves well to precise static typing,
and I tried exploit opportunities for automatic type inference wherever
possible.

As an example, let's look at `onAction` again. As mentioned before, it accepts
an `createAction` action creator in place of of an action type. I added this
option not only for convenience, but also for typing reasons: because the
action creator's static type includes the shape of the actions it produces,
TypeScript's compiler can infer the type of the state update function's
`action` argument without you having to specify it. It will also give you an
error if you explicitly specify an argument type that is not compatible with
the inferred one.

```typescript
// TypeScript

import { createAction, onAction } from 'redux-preboiled'

const multiply = createAction('multiply').withPayload<number>()

const onMultiply1 = onAction(multiply, (state: number, action) => {
  // `action` is inferred to be of type
  // PayloadAction<number, 'multiply'>.
  return state + action.payload
})

const onMultiply1 = onAction(
  multiply,
    (state, action: PayloadAction<string>) => {
    // ERROR: Argument of type
    // 'PayloadActionCreator<number, "multiply">'
    // is not assignable to parameter of type
    // 'TypedActionCreator<string, any>'.
  }
)
```

Note how in the snippet above, `createAction(…).withPayload()` allows us
to specify the type of the payload using a type parameter - another way in
which Preboiled helps you keep your code type-safe.

## What about Redux Starter Kit?

About a year ago, Redux core maintainer [Mark Erikson][redux-starter-kit]
released [Redux Starter Kit][redux-starter-kit], a library that makes it easy
to get productive in Redux. It is similar to Redux Preboiled in that it also
includes a bunch of helper functions, including a
[`createAction`][rsk-create-action] function that inspired the Preboiled
equivalent. In fact, before I started Preboiled, I helped [porting Redux
Starter Kit to TypeScript][rsk-typescript].

However, the two libraries differ somewhat in their approach. The vision
behind Redux Starter Kit is to become a "[create-react-app][create-react-app]
of Redux" - an opinionated plug-and-play Redux setup that lets you hit the
ground running without wasting time on menial tasks like integrating [Dev
Tools][redux-devtools] or deciding on a side effects library ([Redux
Thunk][redux-thunk] is pre-configured). The flip side, of course, is that you
might get things that are more than, or different from, what you want; for
instance, Redux Starter Kit's `createReducer` helper pulls in [Immer][immer]
for simplified immutable updates, even if you have no interest in leveraging
that integration.

Redux Preboiled, on the other hand, takes more of a toolkit approach. It
doesn't help with setting up your Redux store or choosing your middleware.
Instead, it just gives you set of useful tools, each of which you can use or
ignore as needed. This flexibility results in a bit less convenience, but
makes the libary useful to a wider set of Redux projects.

Ulimately, Redux Starter Kit and Preboiled are not really conflicting choices.
You may well use the latter on top of a store set up with the former. I also
believe there is a lot of room for cross-pollination, and I can see myself
contributing bits of Preboiled to Starter Kit as well if they are good fits.

## Ready for Serving

Version 0.1.0 of Redux Preboiled is now [available on
NPM][redux-preboiled-npm] and [GitHub][redux-preboiled-github]. The current
set of helpers is still very small, but should grow over time to cover more
sources of Redux boilerplate.

To get started, check out the [documentation][redux-preboiled-docs], which
includes several guides and also detailed API docs for all of the helpers.
Enjoy!

[create-react-app]: https://github.com/facebook/create-react-app
[immer]: https://github.com/mweststrate/immer
[lodash]: https://lodash.com/
[redux]: https://redux.js.org
[redux-actions-boilerplate]: https://redux.js.org/recipes/reducing-boilerplate#actions
[redux-boilerplate]: https://redux.js.org/recipes/reducing-boilerplate
[redux-counter]: https://redux.js.org/introduction/examples#counter-vanilla
[redux-crud]: https://github.com/Versent/redux-crud
[redux-devtools]: https://github.com/reduxjs/redux-devtools
[redux-orm]: https://github.com/redux-orm/redux-orm
[redux-preboiled]: https://redux-preboiled.js.org
[redux-preboiled-docs]: https://redux-preboiled.js.org/docs
[redux-preboiled-npm]: https://npmjs.com/redux-preboiled
[redux-starter-kit]: https://redux-starter-kit.js.org
[redux-thunk]: https://github.com/reduxjs/redux-thunk
[rematch]: https://github.com/rematch/rematch
[rsk-create-action]: https://redux-starter-kit.js.org/api/createaction
[rsk-typescript]: https://github.com/reduxjs/redux-starter-kit/pull/73
[typescript]: https://typescriptlang.org
