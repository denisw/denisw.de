---
tags: post
layout: post
date: 2020-04-24
title: Answering Your App's Questions with Redux Selectors
description: |
  Redux selectors can be a powerful tool for encapsulating
  application logic.
---

Of all concepts in [Redux](https://redux.js.org/), _selectors_ are the most underestimated. They have recently gained importance by the introduction of [React Redux hooks](https://react-redux.js.org/next/api/hooks), which make them the primary means of getting data out of Redux into React components. However, I noticed that selectors are often only seen as either "state getters" to hide the Redux state's shape, or as performance optimizations for preventing state-derived values from being needlessly recalculated.

In this post, I'll show that selectors can be much more than that. Specifically, I'll demonstrate that they are not only a great tool for accessing Redux state, but also for _encapsulating application logic_ in a way that is easy to reason about, scale, reuse, and test. As we're going to see, all it takes is a shift in perception.

## About Selectors

In Redux, a __selector__ is a function that takes the store's current state and returns a value extracted or derived from it. For example, consider a currency converter app whose Redux state looks as follows:

```js
const state = {
  sourceAmount: 123.45,  // the amount of money to convert
  sourceCurrency: 'EUR', // The currency of the source amount
  targetCurrency: 'USD'  // the currency to convert to
}
```

Given this state shape, we can write the following simple "state getter" selectors for accessing the source amount, source currency, and target currency, respectively:

```js
function selectSourceAmount(state) {
  return state.sourceAmount;
}

function selectSourceCurrency(state) {
  return state.sourceCurrency;
}

function selectTargetCurrency(state) {
  return state.targetCurrency;
}
```

_(In this post, I prefix every selector's name with `select`. Other popular conventions are to start the name with `get` or end it with `Selector`.)_

As selectors are functions, they don't have to limit themselves to returning values directly from the state. For instance, we can write a selector returning the money amount after currency conversion, building on the basic selectors we defined before:

```js
const conversionRates = {
  'EUR': { 'US': 1.09, /* … */ },
  // …
}

function selectConvertedAmount(state) {
  const sourceCurrency = selectSourceCurrency(state);
  const targetCurrency = selectTargetCurrency(state);
  const rate = conversionRates[sourceCurrency][targetCurrency];
  return getSourceAmount(state) * rate;
}
```

Assuming this is a React app, we can now use these selectors from a component with React Redux:

```jsx
import React from 'react';
import { useSelector } from 'react-redux';

const ConversionResultView = () => {
  const sourceAmount = useSelector(selectSourceAmount);
  const sourceCurrency = useSelector(selectSourceCurrency);
  const targetCurrency = useSelector(selectTargetCurrency);
  const convertedAmount = useSelector(selectConvertedAmount);

  return (
    <p>
      {sourceAmount} {sourceCurrency} is
      {convertedAmount} {targetCurrency}
    </p>
  );
}
```

We could have put all the state access and currency conversion code into `ConversionResultView` directly. Extracting it into standalone selectors has several benefits, however.

### Encapsulation

When using a selector, the caller does not need to know how the Redux state is shaped or which of its data is needed by the selector; it simply passes the state as a whole and gets back the desired value. No matter whether this value comes directly from the state or is computed on the fly, the call is the same. This means that if the state's structure changes, only the selectors themselves need to be updated; their callers are unaffected. Said another way, selectors minimize the [coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) between the Redux store and its consumers.

### Reusability

Once written, a selector can be called from any piece of code with access to the Redux state. This includes not only UI components, but also other selectors: as each selector receives the Redux state as an argument, it has, by definition, all it needs to call any other selector. It is thus easy to reuse existing selectors to compose new ones.

### Purity, Testability & Memoization

Selectors are expected to be [pure functions](https://medium.com/@jamesjefferyuk/javascript-what-are-pure-functions-4d4d5392d49c): given the same input, they always return the same result, without side effects. This makes them easy to reason about in isolation. It also makes them easy to unit-test: we just need to prepare an input state, call the selector, and compare the return value with what we except, like in the following example (using [Jest](https://jestjs.io)):

```js
test('selectConvertedAmount()', () => {
  const state = {
    sourceAmount: 100,
    sourceCurrency: 'EUR',
    targetCurrency: 'USD'
  };
  const result = selectConvertedAmount(state);
  const expectedConversionRate = conversionRates['EUR']['USD'];
  expect(result).toBeCloseTo(100 * expectedConversionRate);
})
```

Purity also enables _memoization_: because we know that a selector's return value will only change if its input - that is, the Redux state - changes, we can avoid recomputing the same value by caching it, only doing a new computation if the passed state is different from the previous one.

The [Reselect](https://github.com/reduxjs/reselect) library is a well-known implementation of this idea. Using it, we could have written the `selectConvertedAmount` selector as follows:

```js
import { createSelector } from 'reselect';

const selectConvertedAmount = createSelector(
  // The first argument(s) of createSelector() define the
  // selector's *dependencies*, that is, the other selectors
  // whose values are needed for this one.
  selectSourceAmount,
  selectSourceCurrency,
  selectTargetCurrency,

  // The last argument is the selector's *implementation*,
  // which receives the return values of its dependencies
  // in the order given above. When the selector is first
  // called, its return value is cached, and the implementation
  // function is not re-run until the passed-in state AND at
  // least one of the dependencies' return values changes
  // (at which point the cache is updated).
  (amount, currency, targetCurrency) => {
    const rate = conversionRates[currency][targetCurrency];
    return amount * rate;
  }
);

```

_(Even though I recommend using Reselect for all but the most basic selectors, I won’t use it for the rest of this post to keep things simple.)_

## Selectors As Little Domain Experts

So far, we have seen that Redux selectors can abstract away the state's shape and avoid redundant computations. But there's more.

To see the full potential of selectors, it helps to reflect on what it means to call one. Intuitively, we might think of it as just fetching or computing a value from the state. However, I realized that it’s much more helpful to see it as _asking a question_, answered by the selector based on the "facts" (state and rules) of the application’s world.

For instance, when `ConversionResultView` uses `selectConvertedAmount` in the example above, it basically asks: "What is the current result of the currency conversion (given the user’s inputs)?" Note that the caller doesn’t even need to know which pieces of information are required to answer the question - all the know-how is in the selector, which just gets what it needs from the application state itself, either by looking it up directly or by asking other selectors.

Seen this way, selectors are like _little domain experts for your app_, specialized on answering a single question about your app's world, and collaborating with other selectors as needed.

This means that whenever we can frame a piece of app logic as a state-dependent question, we can express the answer as a selector, giving us all of the mentioned encapsulation, reusability, testing and optimization benefits. The following sections highlight some example use cases that illustrate this.

### Validation

Validating user inputs is, basically, the act of asking: "Do the user's inputs make sense (given the application's rules)?" This makes validation logic a great match for selectors, as long as you save the data to validate in the Redux state.

For instance, imagine an app for ordering food from a restaurant. The user can only place an order if the order sum is above a particular minimum amount. If we store the currently selected order items in Redux, we can easily write a selector for this rule:

```js
const minimumOrderAmount = 10;

function selectOrderItems(state) {
  return state.order.items;
}

function selectIsOrderValid(state) {
  const items = selectOrderItems(state);
  const price = items.reduce((x, item) => x + item.price, 0);
  return price >= minimumOrderAmount;
}
```

This approach scales nicely as the logic becomes more complex. If, for instance, it is later decided that drinks and desserts shouldn't count towards the minimum amount, we can do this change locally in the selector without affecting any of its users.

### Filtering, Sorting and Aggregation

Selectors are great for processing collections of items using arbitrarily complex rules. For instance, to answer the question "Which tasks have all of the tags selected by the user?", we can write a selector like the following:

```js
function selectAllTasks(state) {
 return state.tasks;
}

function selectSelectedTags(state) {
  return state.filter.tags;
}

function selectFilteredTasks(state) {
  const tasks = selectAllTasks(state);
  const tags = selectSelectedTags(state);

  return tasks.filter((task) =>
    tags.every((tag) => task.tags.includes(tag));
  );
}
```

As new kinds of filters get added, `selectFilteredTasks` can be extended to take these into account as well, keeping the rest of the codebase unchanged. Sorting can be handled the same way.

We can also do other types of aggregations using selectors. For example, when writing an online quiz app, a selector for calculating the user's current score could look like this:

```js
function selectCorrectAnswers(state) {
  return state.quiz.answers;
}

function selectGivenAnswers(state) {
    return state.round.answers;
}

function selectScore(state) {
  const correctAnswers = selectCorrectAnswers(state);
  const givenAnswers = selectGivenAnswers(state);

  return givenAnswers.reduce((answer, score, index) => {
    const isCorrect = answer == correctAnswers[index];
    return score + (isCorrect ? 1 : 0);
  }, 0);
}
```

### Separating Logic from Side Effects

Many apps integrate side effects into the Redux flow using [thunks](https://github.com/reduxjs/redux-thunk), [sagas](https://redux-saga.js.org), [epics](https://redux-observable.js.org), or similar abstractions. In some cases, especially complex ones, these need to consult the application state to determine which operations to perform or which parameters to pass to them.

Instead of mixing this logic with the side effects (which are usually tedious to test because they require mocking the actual effects), we can extract it into selectors, making the actual side effect code as lean as possible. All of the popular side effect libraries have an easy way to do this; for instance, Redux Saga offers the [`select` effect](https://redux-saga.js.org/docs/api/#selectselector-args), which helps us simplify sagas as in the following example:

```js
function selectCurrentStep(state) {
  return state.checkout.currentStep;
}

function selectIsNewUser(state) {
  return state.checkout.isNewUser;
}

function selectNextStep(state) {
  switch (selectCurrentStep(state)) {
    case 'shoppingCart':
      return 'login';
    case 'login':
      return selectIsNewUser(state) ? 'address' : 'summary';
   // ...
  }
}

function* nextStepSaga() {
  const nextStep = yield select(selectNextStep);
  yield call(navigateToStep, nextStep);
}
```

This makes it easy to test most of the logic independently of the saga, for which we just need to check whether the value returned by the `select` is correctly forwarded to the `navigateToStep` effect:

```js
test('nextStepSaga()', () => {
  const generator = nextStepSaga();
  let effect;

  // Run until `yield select()`
  effect = generator.next();
  expect(effect).toEqual(select(selectNextStep));

  // Continue as if the selector returned 'login'
  effect = generator.next('login');
  expect(effect).toEqual(call(navigateToStep, 'login'));
});
```

## The Limits of Selectors

While Redux selectors can do many things, they cannot do _all_ things.

Firstly, selectors only have access to state that is in the Redux store, so their power is limited by how much of the app's state is kept in Redux. They are less useful for apps that use Redux only for small bits of state, for instance because most data is fetched and managed using a [GraphQL](https://graphql.org) library. One way to mitigate this problem is to add extra parameters to selectors, allowing non-Redux state to be passed, but that reduces uniformity (making selector composition more difficult) and makes memoization more difficult. Another is to write _selector factories_, which take all required non-Redux data and return a selector as a result:

```js
function makeSelectTask(taskId) {
  return (state) => state.tasks[taskId];
}

function TaskItem({ taskId }) {
  const selectTask = useMemo(
    () => makeSelectTask(taskId),
    [taskId]
  );
  const task = useSelector(selectTask);
  return <li>{task.title}</li>;
}
```

Secondly, selectors are pure and synchronous, so they cannot consult external sources such as backend APIs. For cases where this is needed, Redux side effect abstractions like sagas are a better fit. Even then, you can still choose to extract the pure parts of the logic into selectors, as we've seen before.

Lastly, with selectors we can only express "static" logic that depends only on the current application state. For "dynamic" logic that is based on _events_ – [state machines](https://en.wikipedia.org/wiki/Finite-state_machine), for example – Redux offers [reducers](https://redux.js.org/basics/reducers/).

## Conclusion

Viewing Redux selectors as "little domain experts", answering the application's questions by consulting its state, reveals that they can do much more than just hiding the state's shape or caching values. We can use them for filtering and aggregating data, validating user inputs, making control flow decisions for side effects, and many other types of application logic. Because selectors are pure and uniform in how they are called, they make application logic easy to reason about, compose, reuse, and test.

## Resources

- ["Computing Derived Data" (Redux docs)](https://redux.js.org/recipes/computing-derived-data)
- [Reselect](https://github.com/reduxjs/reselect)
