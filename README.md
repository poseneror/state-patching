# state-patching [WIP]
This library implements the general state patching theoretical model

## Who is this for?
State patching is deigned to support optimistic updates with a unique approach.
Suppose you have a list of tickets, in your to-do app, and you'd like to update a ticket, but the server response takes a while.
Optimistic updates lets you **perform the update in your client** while preserving an **eventually consistent** server approach by performing the server operation asynchronously.
The issue here is that sometimes the server operation fails, and thus we'll have to **revert the changes made in the client**.

## Using StatePatching
`useStatePatching` has a simillar api to this of `useState`, with the exception of one small modification - `setState` returns a `undo()` function.
This is a small example of how this could be used to revert your ticket system to it's previous state after server failue.
```ts

const [tickets, setTickets] = useStatePatching(initialTicketsFromServer);

const createTicket = async (string title) => {

  string tempId = generateTempId();
  const { undo  } = setTickets(currentTickets => {
    ...currentTickets,
    [tempId]: { title },
  });
  try {
    const createTicketResponse = await serverApi.createTicket(title);
    updateTicketId(tempId, createTicketResponse.id);
  } catch (e) {
    undo()
  }
});
```

## Why is it so unique?
useStatePatching maintains a **state change tree**, which means that it doesn't just return to the previous state, but applies a **"patch" that reverts the specific update made**.
This is unique since it allows the user to perform **multiple async changes**, that may be **fulfilled at any** order.

Let's describe the scenerio:

```ts
useEffect(() => {
  createTicket("some ticket");
  createTicket("some other ticket");
});
```

In this example, imagine that "some ticket" creation has failed, and that the request took some time to get rejected.
Meanwhile "some other ticket" was created successfully.

In traditional approaches, reverting will return the state to what it was before the failed operation, resulting in:

```ts
tickets = {
  ...initialTicketsFromServer
}
```
Using state patching, you'll receive the following result, which is what you originally intended.

```ts
tickets = {
  ...initialTicketsFromServer,
  newTicketId: { title: "some other ticket" },
}
```
